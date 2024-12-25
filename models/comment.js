const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    date_created: {type: String},
    text: {type: String, required: true},
    madeBy: {type: Schema.Types.ObjectId, ref: "User"},
    madeFor: {type: Schema.Types.ObjectId, ref: "Blog"}
});


module.exports = mongoose.model("Comment", CommentSchema);