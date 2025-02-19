import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "./authTypes";

export type GetUsers = (req: Request<{ id?: string }>, res: Response) => Promise<void>;
export type UserBody = { email: string; password?: string; username?: string };

export type RegisterUser = (
  req: Request<
    {}, // No route parameters
    {}, // No specific response body type
    { username: string; email: string; password: string } // Request body type
  >,
  res: Response
) => Promise<void>;

export type LoginUser = (req: Request<{}, {}, UserBody>, res: Response) => void;

export type LogoutUser = (req: AuthenticatedRequest, res: Response) => void;

export type UserValidation = (
  req: Request<{}, {}, UserBody>,
  res: Response,
  next: NextFunction
) => void;
