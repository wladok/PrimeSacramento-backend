const express = require("express");
const axios = require("axios");
const cors = require("cors");
const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const BOT_TOKEN = "7696883936:AAGDnnhI897bdBWMELFApyplPcDmSWPEWzU";
const CHAT_ID = "1357735944";

app.post("/send", upload.single("photo"), async (req, res) => {
  try {
    const { name, phone, message } = req.body || {};
    const photo = req.file;

    const text =
`🛠️ New Request

👤 Name: ${name}
📞 Phone: ${phone}

💬 Message:
${message || "No description"}`;

    if (photo) {
        const form = new FormData();

        form.append("chat_id", CHAT_ID);
        form.append("caption", text);
        form.append("photo", photo.buffer, {
            filename: "photo.jpg"
        });

        await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
            form,
            {
            headers: form.getHeaders(),
            }
        );
    }
     else {
      await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          chat_id: CHAT_ID,
          text: text
        }
      );
    }

    res.send("Application sent successfully!");
  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).send("Error sending application");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
