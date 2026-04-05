import mongoose, { Schema } from "mongoose";

const importantDateSchema = new Schema(
    {
        openDate: { type: String, default: "" },
        closeDate: { type: String, default: "" },
        resultsDate: { type: String, default: "" },
        acceptDate: { type: String, default: "" },
        collegeDate: { type: String, default: "" }
    },
    { timestamps: true }
);

export const ImportantDate = mongoose.model("ImportantDate", importantDateSchema);
