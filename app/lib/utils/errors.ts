export class AppError extends Error {
  status: number
  constructor(message: string, status: number = 500) {
    super(message)
    this.name = this.constructor.name
    this.status = status
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message, 401)
  }
}

export class PaymentRequiredError extends AppError {
  constructor(message: string) {
    super(message, 402)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404)
  }
}

export class MethodNotAllowedError extends AppError {
  constructor(message: string) {
    super(message, 405)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409)
  }
}

export class GoneError extends AppError {
  constructor(message: string) {
    super(message, 410)
  }
}

export class UnsupportedMediaTypeError extends AppError {
  constructor(message: string) {
    super(message, 415)
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string) {
    super(message, 422)
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string) {
    super(message, 429)
  }
}

export class InternalServerError extends AppError {
  constructor(message: string) {
    super(message, 500)
  }
}

export class NotImplementedError extends AppError {
  constructor(message: string) {
    super(message, 501)
  }
}

export class BadGatewayError extends AppError {
  constructor(message: string) {
    super(message, 502)
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string) {
    super(message, 503)
  }
}

export class GatewayTimeoutError extends AppError {
  constructor(message: string) {
    super(message, 504)
  }
}

export class ValidationError extends AppError {
  errors: Record<string, string>
  constructor(message: string, errors: Record<string, string>) {
    super(message, 422)
    this.errors = errors
  }
}
