import 'dotenv/config';
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY, 
  timeout: 60000, 
  maxRetries: 2, 
});

export { groq };