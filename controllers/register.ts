import { Request, Response } from "express";
import { Pool, QueryResult, QueryConfig } from "pg";
import { queryDB } from "../db/db";
import * as Yup from "yup";
const bcrypt = require("bcrypt");

const userSchema = Yup.object().shape({
  firstName: Yup.string().required(),
  lastName: Yup.string().required(),
  email: Yup.string().required().email(),
  password: Yup.string().required().min(7).matches(/[0-9]/).matches(/[A-Z]/),
});

async function registerHandler(req: Request, res: Response): Promise<void> {
  const { firstName, lastName, email, password } = req.body;

  try {
    await userSchema.validate({ firstName, lastName, email, password });

    const hashedPassword = await bcrypt.hash(password, 10);

    const QueryStatement: QueryConfig = {
      text: 'INSERT INTO "Freemind".users (Email, firstName, LastName, Password) VALUES ($1::text, $2::text, $3::text, $4::text)',
      values: [email, firstName, lastName, hashedPassword],
    };

    queryDB(QueryStatement, (err: Error, result: QueryResult) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Registration Faile" });
      } else {
        console.log("User registered successfully");
        res.json({ message: "Registration successful" });
      }
    });
  } catch (error) {
    console.error("Validation error", error);
    res.status(400).json({ error: "Validation error" });
  }
}

export { registerHandler };

// userSchema
//   .validate({ firstName, lastName, email, password })
//   .then(() => {
//     const QueryStatement = {
//       text: 'INSERT INTO "Freemind".users (Email, firstName, LastName, Password) VALUES ($1::text, $2::text, $3::text, $4::text)',
//       values: [email, firstName, lastName, password],
//     };
//     queryDB(QueryStatement, (err: Error, result: QueryResult) => {
//       if (err) {
//         console.error("Database query error", err);
//         res.status(500).json({ error: "Registration Failed" });
//       } else {
//         console.log("User registered successfully");
//         res.json({ message: "Registration successful" });
//       }
//     });
//   })
//   .catch((error: any) => {
//     console.error("Validation error", error);
//     res.status(400).json({ error: "Validation error" });
//   });
