import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const warnConn = mongoose.createConnection(process.env.MONGODB_URI_WARN);

const WarnSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  warns: [
    {
      reason: { type: String, required: true },
      date: { type: Date, default: Date.now },
      moderator: { type: String, required: true },
    },
  ],
});

export default warnConn.model("Warn", WarnSchema);
