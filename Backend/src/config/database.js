import mongoose from "mongoose";

 const connectDB = async()=> {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log("DB connected");
    }
    catch(err){
        console.log(err);
        process.exit(1);
    }
}

export default connectDB;