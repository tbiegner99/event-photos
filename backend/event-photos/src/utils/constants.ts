export class HTTPStatus {
  static OK: number = 200;
  static CREATED: number = 201;
  static NO_CONTENT: number = 204;
  static BAD_REQUEST: number = 400;
  static UNAUTHORIZED: number = 401;
  static FORBIDDEN: number = 403;
  static CONFLICT: number = 409;
  static SERVER_ERROR: number = 500;
}

export class Roles {
  static SYSTEM_ADMIN: string = 'system_admin';
  static EVENTS_ADMIN: string = 'events_admin';
  static EVENT_MANAGER: RegExp = /^event_manager:(.+)$/;
}
