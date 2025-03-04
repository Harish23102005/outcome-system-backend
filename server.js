require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Student Model
const StudentSchema = new mongoose.Schema({
  studentId: String, // Unique ID for tracking
  name: String,
  course: String,
  tests: [
    {
      marks: Number,
      totalMarks: Number,
      date: { type: Date, default: Date.now },
    },
  ],
});

const Student = mongoose.model("Student", StudentSchema);

// ✅ Add Student Marks (POST /add-student)
app.post("/add-student", async (req, res) => {
  const { studentId, name, course, marks, totalMarks } = req.body;

  if (!studentId || !name || !course || !marks || !totalMarks) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    let student = await Student.findOne({ studentId });

    if (!student) {
      student = new Student({ studentId, name, course, tests: [] });
    }

    student.tests.push({ marks, totalMarks });
    await student.save();

    res.json({ message: "✅ Student data saved successfully!" });
  } catch (error) {
    console.error("❌ Error saving student:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Fetch Student Performance Data (GET /student-performance/:studentId)
app.get("/student-performance/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ name: student.name, tests: student.tests });
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Use PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
