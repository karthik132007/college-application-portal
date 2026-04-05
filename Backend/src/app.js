import express from "express";
import cors from "cors";
import userRoutes from "./routes/auth.route.js";
import applicationRoutes from "./routes/application.route.js";
import notificationRoutes from "./routes/notification.route.js";
import datesRoutes from "./routes/importantDate.route.js";
import examRoutes from "./routes/examSlot.route.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dates', datesRoutes);
app.use('/api/exams', examRoutes);

// Health check
app.get('/api/health', (req, res) => {
	res.send("Its running");
});

export default app;