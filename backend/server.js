const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5000", 
  "https://codewiznik-profile.onrender.com"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model("Contact", contactSchema);

// Contact Form API with email notification
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Save to MongoDB
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // your App Password
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to yourself
      subject: `New Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error!" });
  }
});

// Admin Dashboard
app.get("/dashboard", async (req, res) => {
  const password = req.query.password;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).send("❌ Unauthorized");
  }

  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    let tableRows = contacts.map((c, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${c.name}</td>
        <td>${c.email}</td>
        <td>${c.message}</td>
        <td>${new Date(c.createdAt).toLocaleString()}</td>
      </tr>
    `).join("");

    res.send(`
      <html>
        <head>
          <title>Admin Dashboard - CodeWizNik</title>
          <style>
            body { font-family: Arial, sans-serif; background: #111; color: #fff; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #555; padding: 8px; text-align: left; }
            th { background: #222; }
            tr:nth-child(even) { background: #1a1a1a; }
          </style>
        </head>
        <body>
          <h1>Admin Dashboard</h1>
          <p>Total Messages: ${contacts.length}</p>
          <table>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Sent At</th>
            </tr>
            ${tableRows}
          </table>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send("Server error!");
  }
});

// Fallback: send index.html for unknown routes (important for Render)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
