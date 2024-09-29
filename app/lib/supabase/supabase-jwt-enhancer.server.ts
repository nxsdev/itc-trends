import { AuthError, type Session, type SupabaseClient } from "@supabase/supabase-js"
import * as jose from "jose"
import type { SupabaseJwt } from "./types"
/**
 * Represents the response structure for authentication operations.
 */
type AuthResponse = {
  data: {
    session: Session | null
  }
  error: AuthError | null
}

/**
 * Extends the SupabaseClient with a locals object containing the getSession method.
 */
export interface EnhancedSupabaseClient extends SupabaseClient {
  locals: {
    getSession: () => Promise<AuthResponse>
  }
}

/**
 * Creates an enhanced Supabase client with additional authentication methods.
 *
 * @param supabaseClient - The original Supabase client instance.
 * @param jwtSecret - The secret used to sign and verify JWTs.
 * @returns An extended Supabase client with the locals.getSession method.
 */
export function enhanceSupabaseJWT(
  supabaseClient: SupabaseClient,
  jwtSecret: string
): EnhancedSupabaseClient {
  const extendedClient = supabaseClient as EnhancedSupabaseClient

  // if ("suppressGetSessionWarning" in supabaseClient.auth) {
  //   // @ts-expect-error - suppressGetSessionWarning is not part of the official API
  //   supabaseClient.auth.suppressGetSessionWarning = true
  // } else {
  //   console.warn(
  //     "SupabaseAuthClient#suppressGetSessionWarning was removed. See https://github.com/supabase/auth-js/issues/888."
  //   )
  // }

  extendedClient.locals = {
    getSession: () => getSafeSession(supabaseClient, jwtSecret),
  }

  return extendedClient
}

/**
 * Retrieves and verifies the user's session.
 *
 * @param supabase - The Supabase client instance.
 * @param jwtSecret - The secret used to sign and verify JWTs.
 * @returns A promise that resolves to an AuthResponse.
 */
async function getSafeSession(supabase: SupabaseClient, jwtSecret: string): Promise<AuthResponse> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      return createAuthResponse(null, error)
    }

    if (!session) {
      return createAuthResponse(null)
    }

    const { payload: decoded }: { payload: SupabaseJwt } = await jose.jwtVerify(
      session.access_token,
      new TextEncoder().encode(jwtSecret)
    )

    // Create an enhanced session object
    const validatedSession: Session = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: decoded.exp,
      expires_in: decoded.exp - Math.round(Date.now() / 1000),
      token_type: "bearer",
      user: {
        app_metadata: decoded.app_metadata ?? {},
        aud: "authenticated",
        created_at: "",
        id: decoded.sub,
        email: decoded.email,
        phone: decoded.phone,
        user_metadata: decoded.user_metadata ?? {},
        is_anonymous: decoded.is_anonymous,
      },
    }

    return createAuthResponse(validatedSession)
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      return refreshSession(supabase, jwtSecret)
    }
    return handleError(error, "Failed to verify session")
  }
}

/**
 * Refreshes the session using the Supabase client.
 *
 * @param supabase - The Supabase client instance.
 * @param jwtSecret - The secret used to sign and verify JWTs.
 * @returns A promise that resolves to an AuthResponse.
 */
async function refreshSession(supabase: SupabaseClient, jwtSecret: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) {
      return createAuthResponse(null, error)
    }
    if (!data.session) {
      return createAuthResponse(null)
    }

    const decodedPayload = await verifyJWT(data.session.access_token, jwtSecret)
    console.log("decodedPayload", decodedPayload)

    return createAuthResponse(data.session)
  } catch (error) {
    return handleError(error, "Failed to refresh session")
  }
}

/**
 * Verifies a JWT token using JOSE and returns the decoded payload.
 *
 * @param token - The JWT token to verify.
 * @param secret - The secret used to verify the JWT.
 * @returns The decoded JWT payload as an object.
 * @throws {AuthError} If the JWT verification fails.
 */
async function verifyJWT(token: string, secret: string) {
  try {
    const result: jose.JWTVerifyResult = await jose.jwtVerify(
      token,
      new TextEncoder().encode(secret)
    )

    // Return the payload as a plain object
    return result.payload
  } catch (error) {
    throw new AuthError(
      error instanceof Error ? error.message : "JWT verification failed",
      401,
      "jwt_verification_error"
    )
  }
}

/**
 * Creates a standardized AuthResponse object.
 *
 * @param session - The session object to include in the response, or null if no session exists.
 * @param error - An optional error object to include in the response.
 * @returns An AuthResponse object with the provided session and error.
 */
function createAuthResponse(session: Session | null, error: AuthError | null = null): AuthResponse {
  return { data: { session }, error }
}

/**
 * Handles errors by logging them and creating an appropriate AuthResponse.
 *
 * @param error - The error that occurred.
 * @param defaultMessage - A default message to use if the error is not an instance of Error.
 * @returns An AuthResponse object with no session and an AuthError.
 */
function handleError(error: unknown, defaultMessage: string): AuthResponse {
  console.error(defaultMessage, error)
  const authError =
    error instanceof AuthError
      ? error
      : new AuthError(error instanceof Error ? error.message : defaultMessage)
  return createAuthResponse(null, authError)
}
