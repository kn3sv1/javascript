declare module 'json-server' {
  import { RequestHandler, Router } from 'express';

  export function router(source: string): Router;
  export function defaults(options?: Record<string, unknown>): RequestHandler;
  export const bodyParser: RequestHandler;
}
