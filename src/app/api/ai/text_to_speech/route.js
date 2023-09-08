import { NextResponse } from "next/server";
const axios = await import("axios");
const fs = await import("fs");

export async function PUT(req) {
  const body = await req.json();
  const { text, ttsId, model_id } = body;

  const apiLink = process.env.API_URI;
  const apiKey = process.env.API_KEY;
  const webLink = process.env.WEB_LINK;

  const CHUNK_SIZE = 1024;
  const url = apiLink + model_id;

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "xi-api-key": apiKey,
  };

  const data = {
    text: text,
    model_id: "eleven_monolingual_v1",
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5,
    },
  };

  const audioFilePath = `public/audios/${ttsId}_response_audio.mp3`;

  try {
    const response = await axios.default.post(url, data, {
      headers: headers,
      responseType: "stream",
      timeout: 62000,
    });

    const writer = fs.default.createWriteStream(audioFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", () => {
        console.log("Audio file saved:", audioFilePath);
        resolve();
      });

      writer.on("error", (err) => {
        console.error("Error writing audio file:", err);
        reject(err);
      });
    });

    const link = audioFilePath.replace(/^public\//, "");
    return NextResponse.json({ ttsAudioUrl: webLink + link });
  } catch (error) {
    console.error("API request error:", error);
    return NextResponse.json({ error: "API request error" }, 500);
  }
}