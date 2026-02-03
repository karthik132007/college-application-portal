import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDB from "./config/database.js";

const startServer = async()=>{
    try {
    await connectDB();

    app.on("error",(error)=>{
        console.log("ERROR",error);
        throw error;
    });

    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on port :${process.env.PORT}`);

    });
    } catch (err) {
        console.log("DB connection failed",err);
    }
}

startServer();
