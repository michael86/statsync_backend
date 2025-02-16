import { RequestHandler, Request } from "express";
import jwt, { TokenExpiredError, JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import { deleteRefreshToken, selectRefreshToken } from "../../queries/authQueries";
import bcrypt from "bcryptjs";
import { getClientFingerprint, invalidateSession } from "../../utils/auth";
import { AuthenticatedRequest } from "../../types/authTypes";

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

    // Verify the access token
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

export const validateRefreshToken: RequestHandler = async (
  req: AuthenticatedRequest,
  res,
  next
) => {
  try {
    const { refresh_token_id } = req.cookies;
    const { refresh_token: clientToken } = req.body;

    if (!refresh_token_id || !clientToken) {
      await invalidateSession(res, "access forbidden", refresh_token_id);
      return;
    }

    const refreshToken = await selectRefreshToken(refresh_token_id);
    if (!refreshToken) {
      await invalidateSession(res, "invalid refresh token", refresh_token_id);
      return;
    }

    const tokenIsValid = await bcrypt.compare(clientToken, refreshToken.token_hash);
    if (!tokenIsValid) {
      await invalidateSession(res, "invalid refresh token", refresh_token_id);
      return;
    }

    const { deviceIp, userAgent } = getClientFingerprint(req);
    if (deviceIp !== refreshToken.device_ip || userAgent !== refreshToken.user_agent) {
      await invalidateSession(res, "invalid refresh token", refresh_token_id);
      return;
    }

    (req as AuthenticatedRequest).user = { id: refreshToken.user_id };

    next();
  } catch (error) {
    console.error("❌ Refresh token validation error:", error);
    res.status(500).json({ status: "Server error" });
    return;
  }
};
