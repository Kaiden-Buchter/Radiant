import mongoose from "mongoose";
const knownRbxConn = mongoose.createConnection(
  "mongodb+srv://Admin:radiantAdmin8243@radiant.gej3efo.mongodb.net/knownRobloxUser?retryWrites=true&w=majority&appName=Radiant"
);

const KnownRbxUserSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  robloxId: { type: Number, required: true },
  robloxUser: { type: String, required: true },
});

export default knownRbxConn.model("KnownRbxUser", KnownRbxUserSchema);
