const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    address: String,
    role: {
        type: String,
        enum: ["customer", "product manager", "sales manager"],
        default: "customer"
  }
})

const UserModel = mongoose.model("User", UserSchema)
module.exports = UserModel
    
