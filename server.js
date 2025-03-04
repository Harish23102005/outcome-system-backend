require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// ✅ Fix CORS issue (Explicitly allow frontend)
app.use(
  cors({
    origin: "*", // Allow all origins (change this to your frontend URL for security)
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(bodyParser.json());

// ✅ Use Environment Variable for MongoDB Connection
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Move the Student Model Outside of the Route
const Student = mongoose.model(
  "Student",
  new mongoose.Schema({
    name: String,
    marks: Number,
    course: String,
  })
);

// ✅ Root Route (To Check if Backend is Running)
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// ✅ Add Student Route (POST /add-student)
app.post("/add-student", async (req, res) => {
  const { name, marks, course } = req.body;
  if (!name || !marks || !course) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const student = new Student({ name, marks, course });
    await student.save();
    res.json({ message: "✅ Student data saved successfully!" });
  } catch (error) {
    console.error("❌ Error saving student:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Fetch All Students (GET /students)
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find(); // Fetch all students
    res.json(students);
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Use Process PORT or Default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
