import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const knownRbxConn = mongoose.createConnection(process.env.MONGODB_URI_KNOWRBX);

const KnownRbxUserSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  robloxId: { type: Number, required: true },
  robloxUser: { type: String, required: true },
});

export default knownRbxConn.model("KnownRbxUser", KnownRbxUserSchema);
