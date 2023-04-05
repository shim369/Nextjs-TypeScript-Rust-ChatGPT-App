import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type ChatGPTRequest = {
  question: string;
}

type ChatGPTResponse = {
  answer: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatGPTResponse>
) {
  try {
    const { question } = req.body as ChatGPTRequest;
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8081';

    // RustのバックエンドAPIにリクエストを送信
    const response = await axios.post(`${backendUrl}/answer`, { question });

    const answer = response.data.answer;
    res.status(200).json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ answer: 'Error fetching ChatGPT response' });
  }
}
