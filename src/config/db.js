import mongoose from "mongoose";
import env from "./env.js";

const connectDb = async()=>{
    try{
        await mongoose.connect(env.MONGO_URI);
        console.log("Connected to database successfully");
    }
    catch(err){
        console.log("Error connecting to database", err);
        process.exit(1);
    }
}

export default connectDb;