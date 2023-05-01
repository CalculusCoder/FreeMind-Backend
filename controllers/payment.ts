import { Request, Response } from "express";
import { Pool, QueryResult, QueryConfig } from "pg";
import { db } from "../configuration/config";
import { queryDB } from "../db/db";

function paymentHandler(req: Request, res: Response) {
  res.json("Testing");
}

export { paymentHandler };
