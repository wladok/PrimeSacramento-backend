const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const BOT_TOKEN = "7696883936:AAGDnnhI897bdBWMELFApyplPcDmSWPEWzU";
const CHAT_ID = "1357735944";

app.post("/send", async (req, res) => {
  try {
    const { name, phone, message } = req.body;

    const text =
`🛠️ New Request

👤 Name: ${name}

📞 Phone: ${phone}

💬 Message:
${message || "No description"}`;

    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: text
      }
    );

    res.send("Application sent successfully!");
  } catch (error) {
    console.error(error.response?.data || error);

    res.status(500).send("Error sending application");
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
