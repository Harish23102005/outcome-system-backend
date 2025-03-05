require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const asyncHandler = require("express-async-handler");
const Joi = require("joi");

const app = express();

// ✅ Allow CORS (Netlify + Localhost for testing)
app.use(
  cors({
    origin: [
      "https://student-performance-tracker.netlify.app",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// ✅ Middleware
app.use(bodyParser.json());

// ✅ MongoDB Connection
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ✅ Student Model with Indexing
const StudentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true, index: true }, // Index for better performance
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

// ✅ Validation Schema using Joi
const studentSchema = Joi.object({
  studentId: Joi.string().required(),
  name: Joi.string().required(),
  course: Joi.string().required(),
  marks: Joi.number().required(),
  totalMarks: Joi.number().required(),
});

// ✅ Add Student Marks (POST /add-student)
app.post(
  "/add-student",
  asyncHandler(async (req, res) => {
    // Validate request data
    const { error } = studentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { studentId, name, course, marks, totalMarks } = req.body;
    let student = await Student.findOne({ studentId });

    if (!student) {
      student = new Student({ studentId, name, course, tests: [] });
    }

    student.tests.push({ marks, totalMarks });
    await student.save();

    res.json({ message: "✅ Student data saved successfully!" });
  })
);

// ✅ Fetch Student Performance Data (GET /student-performance/:studentId)
app.get(
  "/student-performance/:studentId",
  asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (student.tests.length === 0) {
      return res.json({
        name: student.name,
        message: "No test records available.",
      });
    }

    res.json({ name: student.name, tests: student.tests });
  })
);

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("Welcome to the Student Performance Tracker API!");
});

// ✅ Use PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
