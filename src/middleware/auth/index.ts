import { RequestHandler } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export const validateJWT: RequestHandler = (req, res, next) => {
  try {
    const access_token: string = req.cookies.access_token;
    console.log("access_token ", access_token);
    const refresh_token: string = req.cookies.refresh_token;
    console.log("refresh_token ", refresh_token);

    if (!access_token || !refresh_token) {
      res.status(403).send();
      // Handle logic to delete stuff here
      return;
    }

    jwt.verify(access_token, process.env.JWT_SECRET as string); //if expired or invalid will throw to catch

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({ error: "Token expired" });
      //validate refresh token
      return;
    } else if (error instanceof JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
      // force logout
      return;
    }

    res.status(500).json({ error: "Internal server error" });
  }
};
