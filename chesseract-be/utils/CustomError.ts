export interface ICustomError extends Error {
    statusCode: number;
}
  
export class CustomError extends Error implements ICustomError {
    statusCode: number;
  
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
}