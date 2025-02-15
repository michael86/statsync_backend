import { RequestHandler } from "express";

export const issueRefreshToken: RequestHandler = (req, res, next) => {
  res.send("refresh route");
};
