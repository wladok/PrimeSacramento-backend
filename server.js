const { Resend } = require("resend");

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const multer = require("multer");
const FormData = require("form-data");

const app = express();

const upload = multer({
  storage: multer.memoryStorage()
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const BOT_TOKEN = process.env.BOT_TOKEN || "YOUR_BOT_TOKEN";
const CHAT_ID = process.env.CHAT_ID || "YOUR_CHAT_ID";
const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/send", upload.array("photos", 5), async (req, res) => {
  try {
    const { name, phone, email, message } = req.body || {};
    const photos = req.files || [];

    // Проверка телефона
    const digits = (phone || "").replace(/\D/g, "");

    if (digits.length < 10) {
      return res.status(400).send("Please enter a valid phone number");
    }
    
    const text =
`🛠️ New Request

👤 Name: ${name || "Not provided"}

📞 Phone: ${phone || "Not provided"}

Email: ${email || "Not provided"}

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

    if (email) {
      await resend.emails.send({
        from: "Prime Sacramento Home Services <info@primesacramento.com>",
        to: email,
        subject: "We Received Your Request",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            
            <h2>Thank you for contacting us, ${name}!</h2>

            <p>
              We have received your request and our team will review it shortly.
            </p>

            <p>
              We will contact you as soon as possible.
            </p>

            <hr>

            <h3>Your Request Details:</h3>

            <p>
              <strong>Name:</strong> ${name}
            </p>

            <p>
              <strong>Phone:</strong> ${phone}
            </p>

            <p>
              <strong>Message:</strong><br>
              ${message || "No description"}
            </p>

            <br>

            <p>
              Thank you,<br>
              Prime Sacramento Home Services
            </p>

          </div>
        `
      });
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
