import { Request, Response } from "express";
import sgMail from "@sendgrid/mail";
import { queryDB } from "../db/db";
import { QueryConfig } from "pg";

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY is not defined");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmails = async (req: Request, res: Response) => {
  try {
    const getEmailsQuery = {
      text: 'SELECT email FROM "Freemind".users WHERE is_verified = TRUE;',
    };

    const getEmailsResponse = await queryDB(getEmailsQuery);

    const csvContent =
      "Email\n" +
      getEmailsResponse.rows.map((row) => `"${row.email}"`).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="emails.csv"');

    res.status(200).send(csvContent);

    //sending automatically through smp mail
    // const emails = getEmailsResponse.rows.map((row) => row.email);

    // const baseMsg = {
    //   from: "jared@freemindrecovery.com",
    //   template_id: "d-9004d1da63bb44a5a296133e9c8b26bd",
    // };

    // for (const email of emails) {
    //   const msg: any = {
    //     ...baseMsg,
    //     personalizations: [
    //       {
    //         to: [{ email }],
    //       },
    //     ],
    //   };

    //   await sgMail.send(msg);
    // }

    // res.status(200).send("Succesfully sent all emails");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};
