import mongoose from "mongoose";
const rbxConn = mongoose.createConnection(
  "mongodb+srv://Admin:radiantAdmin8243@radiant.gej3efo.mongodb.net/robloxUser?retryWrites=true&w=majority&appName=Radiant"
);

const RbxUserSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  robloxId: { type: Number },
  verificationCode: { type: String },
  verificationCodeCreatedAt: { type: Date },
});

export default rbxConn.model("RbxUser", RbxUserSchema);
