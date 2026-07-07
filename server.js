const { Resend } = require("resend");

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const multer = require("multer");
const FormData = require("form-data");

const app = express();

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }

    }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PLACE_ID = "ChIJW7QXJibXmoAR0Isl2U5MBXY";
const BOT_TOKEN = process.env.BOT_TOKEN || "YOUR_BOT_TOKEN";
const CHAT_ID = process.env.CHAT_ID || "YOUR_CHAT_ID";
const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/send", (req, res) => {

      upload.array("photos", 5)(req, res, async (err) => {

          if (err instanceof multer.MulterError) {

              if (err.code === "LIMIT_UNEXPECTED_FILE") {
                  return res.status(400).send("You can upload a maximum of 5 photos.");
              }

              return res.status(400).send(err.message);
          }

          if (err) {
              return res.status(400).send(err.message);
          }
    try {
      const {
        name,
        phone,
        email,
        serviceType,
        specificService,
        message
      } = req.body;
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

      📧 Email: ${email || "Not provided"}

      🔧 Category:
        ${serviceType || "Not provided"}

        🛠 Service:
        ${specificService || "Not provided"}

      💬 Message:
      ${message || "No description"}`;

      // Отправляем текст заявки
      const telegramResponse = await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          chat_id: CHAT_ID,
          text: text
        }
      );

      console.log("Telegram:", telegramResponse.data);

      // Отправляем все фотографии
      if (photos.length > 0) {

          const form = new FormData();

          form.append("chat_id", CHAT_ID);

          const media = photos.map((photo, index) => ({
              type: "photo",
              media: `attach://photo${index}`
          }));

          form.append("media", JSON.stringify(media));

          photos.forEach((photo, index) => {
              form.append(`photo${index}`, photo.buffer, {
                  filename: photo.originalname
              });
          });

          await axios.post(
              `https://api.telegram.org/bot${BOT_TOKEN}/sendMediaGroup`,
              form,
              {
                  headers: form.getHeaders()
              }
          );
      }

      if (email) {
        const result = await resend.emails.send({
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
                <strong>Service:</strong> ${serviceType}
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

        console.log(result);
      }

      if (!name || !phone || !email) {
          return res.status(400).send("Missing required fields");
      }

      res.send("Application sent successfully!");
    }
    
    catch (error) {
      console.error(
        error.response?.data ||
        error.message ||
        error
      );

      res.status(500).send("Error sending application");
    }
  });

  /*app.get("/google-reviews", async (req, res) => {
    try {
      const response = await axios.get(
        `https://places.googleapis.com/v1/places/${PLACE_ID}`,
        {
          headers: {
            "X-Goog-Api-Key": process.env.GOOGLE_API_KEY,
            "X-Goog-FieldMask":
              "displayName,rating,userRatingCount,googleMapsUri"
          }
        }
      );

      res.json(response.data);

    } catch (err) {
      console.error(err.response?.data || err.message);
      res.status(500).json({
        error: "Failed to load Google reviews"
      });
    }
  });*/
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
