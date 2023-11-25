import { InternalCode } from '../enums';

export class ResultDTO<T> {
  constructor(public code: InternalCode, public payload: T | null = null) {}

  hasError() {
    return this.code <= 0;
  }
}
