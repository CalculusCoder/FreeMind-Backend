export {};
import { Request, Response } from 'express';
import { loginSchema } from '../validate/validate';
import { queryDB } from '../db/db';

function loginHandler(req: Request, res: Response) {
  const validationResult = loginSchema.validate(req.body);

  if (validationResult.error) {
    console.error('Validation error:', validationResult.error.details);
    return res.send("Failed");
  }

  console.log('Validation successful:', validationResult.value);

  const QueryStatement = {
    text: 'SELECT email, firstname, lastname FROM "Freemind".users WHERE email = $1',
    values: [req.body.email],
  };

  queryDB(QueryStatement, (err: Error, result: any) => {
    if (err) {
      console.error('Database query error', err);
      res.status(500).send('Database query error');
    } else {
      console.log('Database query successful');
      res.json(result.rows);
    }
  });
}

export { loginHandler };
