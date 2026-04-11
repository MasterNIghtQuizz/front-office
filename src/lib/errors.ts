export class BaseError extends Error {
  public statusCode: number;
  public metadata: Record<string, unknown>;

  constructor(message: string, statusCode: number, metadata: Record<string, unknown> = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.metadata = metadata;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends BaseError {
  constructor(message = "Bad Request", metadata = {}) {
    super(message, 400, metadata);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = "Unauthorized", metadata = {}) {
    super(message, 401, metadata);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = "Forbidden", metadata = {}) {
    super(message, 403, metadata);
  }
}

export class NotFoundError extends BaseError {
  constructor(message = "Not Found", metadata = {}) {
    super(message, 404, metadata);
  }
}

export class ConflictError extends BaseError {
  constructor(message = "Conflict", metadata = {}) {
    super(message, 409, metadata);
  }
}

export class InternalServerError extends BaseError {
  constructor(message = "Internal Server Error", metadata = {}) {
    super(message, 500, metadata);
  }
}
