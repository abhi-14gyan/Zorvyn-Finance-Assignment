const mongoose = require("mongoose");
const { DB_NAME } = require("../constants.js"); // destructure if it's an exported const

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`\nMongoDB Connected!! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MONGODB Failed to CONNECT", error);
    process.exit(1);
  }
};

module.exports = connectDB;
