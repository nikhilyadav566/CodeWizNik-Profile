const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files (absolute path for reliability)
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

// Contact Form API
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.status(201).json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error!" });
  }
});

// Admin Dashboard (password protected)
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

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
