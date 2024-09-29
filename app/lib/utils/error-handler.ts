import { AppError, ValidationError } from "./errors"

export function handleError(error: unknown) {
  if (error instanceof ValidationError) {
    return { success: false, errors: error.errors }
  } else if (error instanceof AppError) {
    return { success: false, errors: { _form: error.message } }
  } else if (error instanceof Error) {
    console.error("Unexpected error:", error)
    return {
      success: false,
      errors: { _form: "予期せぬエラーが発生しました。お時間をおいて再度お試しください。" },
    }
  } else {
    console.error("Unknown error:", error)
    return { success: false, errors: { _form: "不明なエラーが発生しました。" } }
  }
}
