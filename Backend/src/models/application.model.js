import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        dob: { type: Date, required: true },
        gender: { type: String },
        nationality: { type: String, required: true },
        
        // Address
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        
        // Academics
        stream: { type: String, required: true },
        program: { type: String, required: true },
        
        // Hostel
        hostelService: { type: String, enum: ['yes', 'no'], default: 'no' },
        hostelType: { type: String },
        
        // Class 12
        college: { type: String, required: true },
        board: { type: String, required: true },
        completionYear: { type: Number, required: true },
        score: { type: Number, required: true },
        
        // Class 10
        class10School: { type: String, required: true },
        class10Board: { type: String, required: true },
        class10Year: { type: Number, required: true },
        class10Score: { type: Number, required: true },
        
        // Documents and Notes
        driveLink: {
            type: String,
            default: ""
        },
        adminFeedback: {
            type: String,
            default: ""
        },
        examSlot: {
            type: String,
            default: ""
        },
        
        status: { type: String, enum: ['Pending', 'Hold', 'Accepted', 'Rejected', 'Student_Accepted'], default: 'Pending' }
    },
    {
        timestamps: true
    }
);

export const Application = mongoose.model("Application", applicationSchema);
