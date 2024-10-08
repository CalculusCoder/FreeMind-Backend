import { Request, Response } from "express";
import { QueryResult } from "pg";
import { queryDB } from "../db/db";
import * as yup from "yup";

const schema = yup.object().shape({
  profile_pic_id: yup.number().min(1).max(15).required(),
});

async function updateProfileImage(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  const { profile_pic_id } = req.body;

  try {
    await schema.validate({ profile_pic_id });

    const changeProfileImageQuery = {
      text: `UPDATE "Freemind".users SET profile_pic_id = $1 WHERE id = $2`,
      values: [profile_pic_id, userId],
    };

    const result: QueryResult = await queryDB(changeProfileImageQuery);

    if (result.rowCount === 0) {
      res.status(404).json({ error: "No user found for this id" });
      return;
    } else {
      res.status(200).json({ message: "Profile image updated successfully" });
    }
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      res.status(400).json({ err: err });
    } else {
      console.error("Error updating profile image:", err);
      res.status(500).json({ error: "Error updating profile image" });
    }
  }
}

export { updateProfileImage };
