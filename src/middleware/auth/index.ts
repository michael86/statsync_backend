import { RequestHandler, Request } from "express";
import jwt, { TokenExpiredError, JsonWebTokenError, JwtPayload } from "jsonwebtoken";

// Extend Express Request to include user and cookies properties
interface AuthenticatedRequest extends Request {
  cookies: {
    access_token?: string;
  };
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

interface CustomJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role?: string;
}

// JWT Middleware
export const validateJWT: RequestHandler = (req: AuthenticatedRequest, res, next) => {
  try {
    const access_token: string | undefined = req.cookies?.access_token;

    if (!access_token) {
      // browser may have deleted cookie due to expiration
      res.status(401).send({ status: "invalid token" });
      return;
    }

    // Verify the access token ONCE
    const decoded = jwt.verify(access_token, process.env.JWT_SECRET as string) as CustomJwtPayload;

    // Assign the decoded token data to req.user
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError || error instanceof JsonWebTokenError) {
      res.status(401).json({ error: "Token invalid or expired" });
      return;
    }

    res.status(500).json({ error: "Internal server error" });
  }
};
