// types.ts
import { Request } from "express";

export interface ExtendedRequest extends Request {
  token?: string;
}
