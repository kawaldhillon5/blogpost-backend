const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotiSchema  = new Schema({
    text: {type: String},
    dateCreated: {type: Date},
});

module.exports = mongoose.model("Notification", NotiSchema);
