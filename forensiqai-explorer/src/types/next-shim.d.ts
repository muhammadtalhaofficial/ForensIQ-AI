declare module 'next' {
  import { IncomingMessage, ServerResponse } from 'http';

  export interface NextApiRequest extends IncomingMessage {
    body: any;
    query: Record<string, any>;
    cookies?: Record<string, string>;
  }

  export interface NextApiResponse<T = any> extends ServerResponse {
    status(code: number): NextApiResponse<T>;
    json(body: T): void;
    send?: (body: any) => void;
  }
}
