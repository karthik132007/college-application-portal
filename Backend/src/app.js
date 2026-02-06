import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.route.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
	res.send("Its running");
});

export default app;