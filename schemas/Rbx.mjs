import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const rbxConn = mongoose.createConnection(process.env.MONGODB_URI_RBX);

const RbxUserSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  robloxId: { type: Number },
  verificationCode: { type: String },
  verificationCodeCreatedAt: { type: Date },
});

export default rbxConn.model("RbxUser", RbxUserSchema);
