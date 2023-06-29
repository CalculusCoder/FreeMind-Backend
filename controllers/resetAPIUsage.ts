import cron from "node-cron";
import { queryDB } from "../db/db";
import { QueryResult } from "pg";

cron.schedule("0 0 * * *", function () {
  const resetCount = {
    text: `UPDATE "Freemind".users SET chatbot_uses = 0`,
  };

  queryDB(resetCount, (err: Error, result: QueryResult) => {
    if (err) {
      console.error("Error resetting database");
    }
  });
});
