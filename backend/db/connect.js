import mongoose from "mongoose";

export const connectionDB = async () => {
  try {
    const dbName = "myDatabase";
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${dbName}`
    );

    if (connectionInstance) {
      console.log("DB Connected");
      console.log(`Host: ${connectionInstance.connection.host}`);
    } else {
      console.log("DB connection error");
    }
  } catch (error) {
    throw error;
  }
};
