import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

// export interface AuthenticatedRequest extends Request {
//   cookies: {
//     access_token?: string;
//     refresh_token?: string;
//     refresh_token_id?: string;
//   };

//   body: {
//     refresh_token?: string;
//   };
// }

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  role?: string;
}

export type IssueRefreshToken = (req: Request, res: Response) => void;

export type ValidateJWT = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export type ValidateRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export type ValidateMe = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export type MeController = (req: Request, res: Response) => Promise<void>;
