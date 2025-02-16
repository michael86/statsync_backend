import { Request } from "express-jwt";

export interface AuthenticatedRequest extends Request {
  cookies: {
    access_token?: string;
    refresh_token?: string;
    refresh_token_id?: string;
  };
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
  body: {
    refresh_token?: string;
  };
}
