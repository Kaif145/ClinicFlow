import mongoose from "mongoose";

export async function connectingDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connected successfully");
    }catch (error){
        console.error("MongoDB Connecting Failed:", error.message);
        process.exit(1);
    }
}