import { Schema, model} from "mongoose";

const userSchema = new Schema({
    name: String,
    photo: String,
    banner: String,
    bio: String,
    city: String,
    phone: String,
    pronouns: String,
    occupation: String,
    email: {type: String, unique: true, lowercase: true, trim: true, index: true},
    password: { type: String, select: false },
    
    // ===== OAuth2 Fields =====
    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },
    authMethod: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
    role: { type: String, enum: ['user', 'host', 'admin', 'moderator'], default: 'user', index: true },
    
    // ===== Password Reset =====
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
    deactivated: { type: Boolean, default: false },
}, { timestamps: true })

export default model("User", userSchema);
