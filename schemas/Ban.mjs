import mongoose from "mongoose";
const bansConn = mongoose.createConnection(
  "mongodb+srv://Admin:radiantAdmin8243@radiant.gej3efo.mongodb.net/bans?retryWrites=true&w=majority&appName=Radiant"
);

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
