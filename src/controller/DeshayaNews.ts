import { Request, Response } from "express";

export const getTopNews = async (req: Request, res: Response) => {
  try {
    const api = "https://sri-lankan-latest-news-api.vercel.app/latest-news/lankadepa/1";
    const resp = await fetch(api);
    const data = await resp.json();

    
    // Take only first 10 news items
    const top10News = data.latestContent?.slice(0, 3) || [];

    return res.status(200).json({ latestContent: top10News });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch news" });
  }
};
