const express = require("express");
const axios = require("axios");
const cors = require("cors");
const multer = require("multer");
const FormData = require("form-data");
const phoneInput = document.getElementById("phone");
const app = express();

const upload = multer({
  storage: multer.memoryStorage()
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const BOT_TOKEN = process.env.BOT_TOKEN || "YOUR_BOT_TOKEN";
const CHAT_ID = process.env.CHAT_ID || "YOUR_CHAT_ID";

app.post("/send", upload.array("photos", 5), async (req, res) => {
  try {
    const { name, phone, message } = req.body || {};
    const photos = req.files || [];

    // Проверка телефона
    const phoneInput = document.getElementById("phone");

        phoneInput.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");

        if (value.length > 10) {
            value = value.slice(0, 10);
        }

        let formatted = "";

        if (value.length > 0) {
            formatted = "(" + value.substring(0, 3);
        }

        if (value.length >= 4) {
            formatted += ") " + value.substring(3, 6);
        }

        if (value.length >= 7) {
            formatted += "-" + value.substring(6, 10);
        }

        e.target.value = formatted;
        });

    const text =
`🛠️ New Request

👤 Name: ${name || "Not provided"}

📞 Phone: ${phone || "Not provided"}

💬 Message:
${message || "No description"}`;

    // Отправляем текст заявки
    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: text
      }
    );

    // Отправляем все фотографии
    if (photos.length > 0) {
      for (const photo of photos) {
        const form = new FormData();

        form.append("chat_id", CHAT_ID);

        form.append("photo", photo.buffer, {
          filename: photo.originalname
        });

        await axios.post(
          `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
          form,
          {
            headers: form.getHeaders()
          }
        );
      }
    }

    res.send("Application sent successfully!");
  } catch (error) {
    console.error(
      error.response?.data ||
      error.message ||
      error
    );

    res.status(500).send("Error sending application");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
