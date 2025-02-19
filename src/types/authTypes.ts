import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

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

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role?: string;
}

export type IssueRefreshToken = (req: AuthenticatedRequest, res: Response) => void;

export type ValidateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

export type ValidateRefreshToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;
