const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName: {type: String, required: true},
    userEmail: {type: String, required: true},
    salt: {type: String, required: true},
    hash: {type: String, required: true},
    dateCreated: {type: Date}
});

module.exports = mongoose.model("User", UserSchema);