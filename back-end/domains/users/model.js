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
    resetToken: String,
    resetTokenExpiry: Date,
}, { timestamps: true })

export default model("User", userSchema);