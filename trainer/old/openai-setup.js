import OpenAI from "openai";

const OPEN_AI_KEY = process.env.OPEN_AI_KEY;
const OPEN_AI_ORGANIZATION_ID = process.env.OPEN_AI_ORGANIZATION_ID;

export const openai = new OpenAI({
  apiKey: OPEN_AI_KEY,
  organization: OPEN_AI_ORGANIZATION_ID,
});
