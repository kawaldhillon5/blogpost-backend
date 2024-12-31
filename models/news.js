const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NewsSchema  = new Schema({
    text: {type: String},
    pushedBy: {type: Schema.Types.ObjectId, ref: "User"},
    dateCreated: {type: Date},
});

module.exports = mongoose.model("News", NewsSchema);
