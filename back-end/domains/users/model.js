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
    email: {type: String, unique: true},
    password: String,
    
    // ===== OAuth2 Fields =====
    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },
    authMethod: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
    
    // ===== Password Reset =====
    resetToken: String,
    resetTokenExpiry: Date,
    deactivated: { type: Boolean, default: false },
}, { timestamps: true })

export default model("User", userSchema);