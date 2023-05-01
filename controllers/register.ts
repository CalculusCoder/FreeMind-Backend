import { Request, Response } from "express";
import { Pool, QueryResult, QueryConfig } from "pg";
import { queryDB } from "../db/db";
import * as Yup from "yup";

const userSchema = Yup.object().shape({
  email: Yup.string().required().email(),
  password: Yup.string().required().min(7).matches(/[0-9]/).matches(/[A-Z]/),
});

function registerHandler(req: Request, res: Response): void {
  const { firstname, lastname, email, password } = req.body;
  userSchema
    .validate({ email, password })
    .then(() => {
      const QueryStatement = {
        text: 'INSERT INTO "Freemind".users (Email, FirstName, LastName, Password) VALUES ($1::text, $2::text, $3::text, $4::text)',
        values: [email, firstname, lastname, password],
      };
      queryDB(QueryStatement, (err: Error, result: QueryResult) => {
        if (err) {
          console.error("Database query error", err);
          res.status(500).json({ error: "Registration Failed" });
        } else {
          console.log("User registered successfully");
          res.json({ message: "Registration successful" });
        }
      });
    })
    .catch((error: any) => {
      console.error("Validation error", error);
      res.status(400).json({ error: "Validation error" });
    });
}

export { registerHandler };
