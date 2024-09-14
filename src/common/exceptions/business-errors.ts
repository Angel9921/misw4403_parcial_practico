export enum BusinessError {
  NOT_FOUND = 'NOT_FOUND',
  PRECONDITION_FAILED = 'PRECONDITION_FAILED',
  BAD_REQUEST = 'BAD_REQUEST',
}

export class BusinessLogicException extends Error {
  constructor(
    public readonly message: string,
    public readonly type: BusinessError,
  ) {
    super(message);
  }
}
