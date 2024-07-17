const PORT = 8000;
const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const openAI = require("openai");

require("dotenv").config();

app.use(cors());
app.use(express.json());

const openai = new openAI({
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
    filePath = req.file.path;
  });
});

app.post("/analyze", async (req, res) => {
  try {
    const prompt = req.body.message;
    console.log(prompt);
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
    });
    console.log(response.choices[0].message.content);
    res.send(response.choices[0].message.content);
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT} 🔥`));
