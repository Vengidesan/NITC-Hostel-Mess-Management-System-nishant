import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import billRoutes from './routes/billRoutes.js';  // Add this
import reportRoutes from './routes/reportRoutes.js'

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // your frontend URL
  credentials: true, // allow cookies, authorization headers, etc.
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/bills', billRoutes);  // Add this
app.use("/api/reports", reportRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'NITC Mess Management API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
