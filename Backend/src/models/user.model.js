import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
    {
        fullName:{
            type: String,
            required:true,
            trim: true
        },
        email:{
            type:String,
            required:true,
            trim: true,
            unique:true,
            lowercase: true
        },
        phone:{
            type:String,
            required:true,
            trim: true
        },
        password:{
            type:String,
            required:true,
            minlength: 8
        },
        stream:{
            type:String,
            required:true,
            enum: ['btech', 'bba', 'bsc', 'bca', 'pharmacy', 'mtech', 'mba', 'mca', 'msc', 'phd']
        },
        program:{
            type:String,
            required:true
        },
        loggedIn:{
            type:Boolean,
            default:false
        },
        role:{
            type:String,
            enum: ['student', 'admin'],
            default: 'student'
        }
    },
    {
        timestamps:true
    }
);

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User",userSchema)