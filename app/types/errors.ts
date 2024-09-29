export const ErrorType = {
  AUTHENTICATION: "AUTHENTICATION",
  MONTHLY_LIMIT: "MONTHLY_LIMIT",
  VALIDATION: "VALIDATION",
  SERVER: "SERVER",
} as const satisfies Record<string, string>

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType]

export interface ErrorResponse {
  success: false
  errorType: ErrorType
  message: string
  validationErrors?: Record<string, string>
}

export function createErrorResponse(
  errorType: ErrorType,
  message: string,
  validationErrors?: Record<string, string>
): ErrorResponse {
  return {
    success: false,
    errorType,
    message,
    validationErrors,
  }
}
