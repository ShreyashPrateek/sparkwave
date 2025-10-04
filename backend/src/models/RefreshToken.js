import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, index: true, unique: true }, // hashed token
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  replacedBy: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model("RefreshToken", refreshTokenSchema);
