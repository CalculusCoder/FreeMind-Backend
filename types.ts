// types.ts
import { Request } from "express";

export interface ExtendedRequest extends Request {
  token?: string;
}

export interface ExtendedRequest extends Request {
  rawBody?: string;
}
