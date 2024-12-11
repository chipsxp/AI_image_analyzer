import express from "express";
import cors from "cors";
import fs from "fs";
import multer from "multer";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 8000;
const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("file");

let filePath;

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    filePath = req.file.path;
    res
      .status(200)
      .json({ message: "File uploaded successfully", path: filePath });
  });
});

app.post("/analyze", async (req, res) => {
  try {
    const prompt = req.body.message;
    console.log(prompt);

    if (!filePath) {
      return res.status(400).json({ error: "No image has been uploaded" });
    }

    const imageAsBase64 = fs.readFileSync(filePath, "base64");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageAsBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });
    console.log(response.choices[0].message.content);
    res.send(response.choices[0].message.content);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || "No additional details available",
    });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT} 🔥`));
