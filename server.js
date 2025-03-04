const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://harishpc23:%23Harishpc23@cluster0.uzl3p.mongodb.net/myDatabase?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const StudentSchema = new mongoose.Schema({
  name: String,
  marks: Number,
  course: String,
});

const Student = mongoose.model("Student", StudentSchema);

app.post("/add-student", async (req, res) => {
  const { name, marks, course } = req.body;
  const student = new Student({ name, marks, course });
  await student.save();
  res.json({ message: "Student data saved!" });
});

app.get("/calculate-co", async (req, res) => {
  const students = await Student.find();
  const totalMarks = students.reduce((sum, student) => sum + student.marks, 0);
  const averageMarks = students.length ? totalMarks / students.length : 0;
  res.json({ averageMarks, attainmentLevel: averageMarks > 50 ? 3 : 2 });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
