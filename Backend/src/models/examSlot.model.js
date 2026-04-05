import mongoose, { Schema } from "mongoose";

const examSlotSchema = new Schema(
    {
        date: { type: String, required: true },
        time: { type: String, required: true },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export const ExamSlot = mongoose.model("ExamSlot", examSlotSchema);
