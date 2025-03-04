require("dotenv").config(); // Load .env variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use Environment Variable for MongoDB Connection
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Root Route (For Testing if Backend is Running)
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Add Student Route (Ensure This Exists)
app.post("/add-student", async (req, res) => {
  const { name, marks, course } = req.body;
  if (!name || !marks || !course) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const Student = mongoose.model(
      "Student",
      new mongoose.Schema({
        name: String,
        marks: Number,
        course: String,
      })
    );
    const student = new Student({ name, marks, course });
    await student.save();
    res.json({ message: "Student data saved!" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Use Process PORT or Default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
