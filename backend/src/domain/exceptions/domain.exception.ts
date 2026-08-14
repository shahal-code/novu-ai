export class DomainException extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundDomainException extends DomainException {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictDomainException extends DomainException {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}

export class UnauthorizedDomainException extends DomainException {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class BadRequestDomainException extends DomainException {
  constructor(message: string = 'Bad request') {
    super(message, 400);
  }
}
