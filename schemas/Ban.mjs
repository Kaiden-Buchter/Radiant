import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const bansConn = mongoose.createConnection(process.env.MONGODB_URI_BANS);

const BanSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  reason: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  guilds: {
    type: [String],
  },
});

const Ban = bansConn.model("Ban", BanSchema);

export default Ban;
