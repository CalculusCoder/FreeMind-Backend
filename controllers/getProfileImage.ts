import { Request, Response } from "express";
import { QueryResult, QueryConfig } from "pg";
import { queryDB } from "../db/db";
import * as yup from "yup";

async function getProfileImage(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;

  // Validate userId
  const schema = yup.string().required();
  try {
    await schema.validate(userId);
  } catch (err) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }

  const getImage: QueryConfig = {
    text: `SELECT profile_pic_id FROM "Freemind".users WHERE id = $1`,
    values: [userId],
  };

  try {
    const result: QueryResult = await queryDB(getImage);

    if (result.rowCount === 0) {
      res.status(404).json({ error: "No image found for this user id" });
      return;
    } else {
      res.status(200).json({ profile_pic_id: result.rows[0].profile_pic_id });
    }
  } catch (err) {
    console.error("Error getting profile image:", err);
    res.status(500).json({ error: "Error getting profile image" });
  }
}

export { getProfileImage };
