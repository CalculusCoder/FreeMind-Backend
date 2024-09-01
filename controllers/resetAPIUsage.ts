import cron from "node-cron";
import { queryDB } from "../db/db";

cron.schedule("0 0 * * *", async function () {
  const resetCount = {
    text: `UPDATE "Freemind".users SET chatbot_uses = 0`,
  };

  try {
    await queryDB(resetCount);
    console.log("Successfully reset chatbot uses in database.");
  } catch (err) {
    console.error("Error resetting database", err);
  }
});
