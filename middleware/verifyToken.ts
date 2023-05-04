import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { ExtendedRequest } from "../types";

function verifyToken(req: ExtendedRequest, res: Response, next: NextFunction) {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}

export default verifyToken;
