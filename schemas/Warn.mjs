import mongoose from "mongoose";
const warnConn = mongoose.createConnection(
  "mongodb+srv://Admin:radiantAdmin8243@radiant.gej3efo.mongodb.net/userWarning?retryWrites=true&w=majority&appName=Radiant"
);

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
