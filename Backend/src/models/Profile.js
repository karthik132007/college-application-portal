import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        stream: {
            type: String,
            required: true
        },
        program: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);
