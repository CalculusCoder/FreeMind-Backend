import { Configuration, OpenAIApi } from "openai";
import { Request, Response } from "express";
import { queryDB } from "../db/db";
import { QueryResult } from "pg";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function getCompletion(req: Request, res: Response) {
  const { message, email } = req.body;

  const checkAPIUsage = {
    text: `SELECT chatbot_uses FROM "Freemind".users WHERE email=$1`,
    values: [email],
  };

  queryDB(checkAPIUsage, (err: Error, result: QueryResult) => {
    if (err) {
      res.status(500).send("Error querying database");
      return;
    }

    if (!result.rows[0] || result.rows[0].chatbot_uses >= 10) {
      res.status(403).send("Daily limit of chatbot usage reached");
      return;
    }

    const incrementCount = {
      text: `UPDATE "Freemind".users SET chatbot_uses = chatbot_uses + 1 WHERE email=$1`,
      values: [email],
    };

    queryDB(incrementCount, (err: Error, result: QueryResult) => {
      if (err) {
        res.status(500).send("Error updating database");
        return;
      }

      handleChatBotQuery(message, res);
    });
  });
}

async function handleChatBotQuery(message: string, res: Response) {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that understands and can provide information on topics such as anxiety, OCD, DPDR, the stress response, nervous system dysregulation, hyperstimulation, and more. Remember to always advise users to seek professional help for any serious concerns.",
        },
        { role: "user", content: `${message}` },
      ],
      max_tokens: 270,
      temperature: 0.7,
    });

    let aiResponse = completion?.data?.choices?.[0]?.message?.content || "";

    const anxietyKeywords = [
      "eliminate anxiety",
      "overcome panic attacks",
      "overcome anxiety",
      "eliminate panic attacks",
      "get rid of intrusive thoughts",
      "eliminate intrusive thoughts",
      "overcome intrusive thoughts",
    ];

    if (
      anxietyKeywords.some((keyword) =>
        message.toLowerCase().includes(keyword.toLowerCase())
      )
    ) {
      aiResponse +=
        "\n\nYou might find the R.A.R.L.M method helpful, which is a science-based approach available on our website to help overcome anxiety, panic attacks and intrusive thoughts.";
    }

    res.json({
      completion: { role: "assistant", content: aiResponse },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error calling API");
  }
}

export { getCompletion };
