// mongoose schema
import mongoose from "mongoose";

const user = new mongoose.Schema({
    userName: {
        type: String,
        unique: true
    },
    password: String,
    isAdmin: {
        type: Boolean,
        default: false
    }
})

export default mongoose.model("User", user)