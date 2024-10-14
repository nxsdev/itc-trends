export class AppError extends Error {
  status: number
  constructor(message: string, status: number = 500) {
    super(message)
    this.name = this.constructor.name
    this.status = status
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request") {
    super(message, 400)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401)
  }
}

export class PaymentRequiredError extends AppError {
  constructor(message: string = "Payment Required") {
    super(message, 402)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Not Found") {
    super(message, 404)
  }
}

export class MethodNotAllowedError extends AppError {
  constructor(message: string = "Method Not Allowed") {
    super(message, 405)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict") {
    super(message, 409)
  }
}

export class GoneError extends AppError {
  constructor(message: string = "Gone") {
    super(message, 410)
  }
}

export class UnsupportedMediaTypeError extends AppError {
  constructor(message: string = "Unsupported Media Type") {
    super(message, 415)
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string = "Unprocessable Entity") {
    super(message, 422)
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = "Too Many Requests") {
    super(message, 429)
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal Server Error") {
    super(message, 500)
  }
}

export class NotImplementedError extends AppError {
  constructor(message: string = "Not Implemented") {
    super(message, 501)
  }
}

export class BadGatewayError extends AppError {
  constructor(message: string = "Bad Gateway") {
    super(message, 502)
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = "Service Unavailable") {
    super(message, 503)
  }
}

export class GatewayTimeoutError extends AppError {
  constructor(message: string = "Gateway Timeout") {
    super(message, 504)
  }
}

export class ValidationError extends AppError {
  errors: Record<string, string>
  constructor(message: string = "Validation Error", errors: Record<string, string>) {
    super(message, 422)
    this.errors = errors
  }
}
