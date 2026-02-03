import express from "express";
import Profile from "./models/Profile.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/api/profiles", async (req, res) => {
    const { fullName, email, phone, password, stream, program } = req.body;

    if (!fullName || !email || !phone || !password || !stream || !program) {
        return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    try {
        const profile = await Profile.create({
            fullName,
            email,
            phone,
            password,
            stream,
            program
        });

        return res.status(201).json({ id: profile._id, message: "Profile created." });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: "Email already exists." });
        }
        return res.status(500).json({ message: "Unable to create profile." });
    }
});

export default app;
