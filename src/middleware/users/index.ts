import { RequestHandler } from "express";

/**
 * Middleware to validate user registration input.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const registerUserValidation: RequestHandler = (req, res, next) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    res.status(400).json({ status: "error", message: "All fields are required" });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ status: "error", message: "Invalid email format" });
    return;
  }

  if (!isValidPassword(password)) {
    res.status(400).json({
      status: "error",
      message:
        "Password must be at least 8 characters long, contain a number, and a special character",
    });
    return;
  }

  next();
};

/**
 * Middleware to validate user login input.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const loginUserValidation: RequestHandler = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ status: "error", message: "Email and password are required" });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ status: "error", message: "Invalid email format" });
    return;
  }

  if (password.length < 8) {
    res
      .status(400)
      .json({ status: "error", message: "Password must be at least 8 characters long" });
    return;
  }

  next();
};

/**
 * Validates an email address format.
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if the email is valid, otherwise false.
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password against security requirements.
 *
 * @param {string} password - The password to validate.
 * @returns {boolean} True if the password meets the criteria, otherwise false.
 */
const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};
