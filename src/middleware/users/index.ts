import { RequestHandler } from "express";
import { queryUserByEmail } from "../../queries/userQueries";

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

  const user = await queryUserByEmail(email);

  if (!email || !password) {
    res.status(400).send({ status: "invalid query" });
    return;
  }

  next();
};
