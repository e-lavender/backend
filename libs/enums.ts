export enum InternalCode {
  Success = 1,
  NotFound = 0,
  Internal_Server = -1,
  Forbidden = -2,
  Unauthorized = -3,
}

export enum EmailEvents {
  Registration,
  Recover_password,
}

export enum ApproachType {
  http = 'selectHttpException',
  qraphql = 'selectGraphQLExceptions',
}
