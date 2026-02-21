import mongoose from "mongoose";


// connect database 

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("DB Connection Failed" , error);
    process.exit(1);
  }
};
