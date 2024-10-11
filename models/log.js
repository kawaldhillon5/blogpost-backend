const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LogSchema  = new Schema({
    category: {type: String},
    entry: {type:String},
    dateCreated: {type: Date},
});

module.exports = mongoose.model("Log", LogSchema);