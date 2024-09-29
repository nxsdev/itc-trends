ALTER TABLE "profile" ADD COLUMN "is_admin" boolean DEFAULT false;--> statement-breakpoint

-- 1. ユーザー作成/更新時のトリガー関数
create or replace function public.handle_auth_user_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- プロフィールテーブルにユーザー情報を挿入または更新
  insert into public.profile (
    id,
    email,
    username,
    full_name,
    avatar_url,
    provider,
    plan,
    is_admin,
    updated_at
  )
  values (
    new.id, -- ユーザーID
    new.email, -- メールアドレス
    coalesce( -- ユーザー名（優先順位: user_name > preferred_username > name）
      new.raw_user_meta_data->>'user_name',
      new.raw_user_meta_data->>'preferred_username',
      new.raw_user_meta_data->>'name'
    ),
    coalesce( -- フルネーム（full_name がなければ name を使用）
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
    new.raw_user_meta_data->>'avatar_url', -- アバターURL
    new.raw_app_meta_data->>'provider', -- 認証プロバイダー
    'free', -- デフォルトのプラン
    false, -- デフォルトで管理者ではない
    now() -- 更新日時
  )
  on conflict (id) do update
  set
    email = excluded.email,
    username = excluded.username,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    provider = excluded.provider,
    -- プランと管理者フラグは既存の値を保持（NULLの場合のみデフォルト値を設定）
    plan = coalesce(profile.plan, 'free'),
    is_admin = coalesce(profile.is_admin, false),
    updated_at = now();

  return new;
end;
$$;

-- 2. トリガーの設定
-- 新しいユーザーが作成されたときのトリガー
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_auth_user_update();

-- ユーザーが更新されたときのトリガー
create or replace trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.handle_auth_user_update();

-- トリガー関数の実行権限を supabase_auth_admin に付与
grant execute on function public.handle_auth_user_update to supabase_auth_admin;


-- 3. カスタムアクセストークンフックを作成
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  claims jsonb;
  user_plan text;
  user_is_admin boolean;
begin
  -- ユーザーのプランとis_admin状態を取得
  select plan, is_admin into user_plan, user_is_admin
  from public.profile
  where id = (event->>'user_id')::uuid;

  -- ユーザーがプロフィールテーブルに存在しない場合、デフォルト値で挿入
  if user_plan is null then
    insert into public.profile (id, email, plan, is_admin)
    values (
      (event->>'user_id')::uuid,
      (event->'claims'->>'email'),
      'free',
      false
    )
    returning plan, is_admin into user_plan, user_is_admin;
  end if;

  claims := event->'claims';

  -- user_metadataが存在することを確認
  if claims->'user_metadata' is null then
    claims := jsonb_set(claims, '{user_metadata}', '{}');
  end if;

  -- planとis_adminをuser_metadataに追加
  claims := jsonb_set(claims, '{user_metadata, plan}', to_jsonb(user_plan));
  claims := jsonb_set(claims, '{user_metadata, is_admin}', to_jsonb(user_is_admin));

  -- イベント内のclaimsを更新
  event := jsonb_set(event, '{claims}', claims);

  return event;
end;
$$;

-- 4. Row Level Security (RLS) の設定
alter table public.profile enable row level security;

create policy "Users can view and update own profile"
  on public.profile
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 5. 必要な権限設定
grant usage on schema public to anon, authenticated;
grant all on table public.profile to authenticated;
grant all on table public.profile to service_role;

-- 6. 関数の実行権限設定
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
grant usage on schema public to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;--> statement-breakpoint