import { Schema, model} from "mongoose";

const userSchema = new Schema({
    name: String,
    photo: String,
    phone: String,
    email: {type: String, unique: true},
    password: String,
}, { timestamps: true })

export default model("User", userSchema);