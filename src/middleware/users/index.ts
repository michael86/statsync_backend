import { RequestHandler } from "express";

export const registerUserValidation: RequestHandler = (req, res, next) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    res.status(400).send({ status: "invalid query" });
    return;
  }

  //add more validation here to ensure password matches requirem,ents and email is email and so on
  next();
};

export const loginUserValidation: RequestHandler = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).send({ status: "invalid query" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).send({ status: "Invalid email format" });
    return;
  }

  if (password.length < 8) {
    res.status(400).send({ status: "Password must be at least 8 characters long" });
    return;
  }

  next();
};
