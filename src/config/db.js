import mongoose from "mongoose";

const connectDb = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database Connected")
    } catch (error) {
        console.error("Unable to connect to DB: ", error.message);
        process.exit(1);
    }
}

export default connectDb;