import { Request } from "express";

// Declare our JWT_SECRET to prevent compile errors
declare namespace NodeJS {
  interface ProcessEnv {
    JWT_SECRET: string;
  }
}
