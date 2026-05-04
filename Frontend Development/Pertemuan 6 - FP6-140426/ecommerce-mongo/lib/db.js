import mongoose from "mongoose";

let isConnected = false;

export async function connect() {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export const db = {
  getConnection: async () => {
    return connect();
  },
};