const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const publishBlogRequestSchema = new Schema({
    blog: {type: Schema.Types.ObjectId, ref : "Blog"},
    user: {type: Schema.Types.ObjectId, ref: "User"},
    title:{type: String},
});

module.exports = mongoose.model("publishBlogRequest", publishBlogRequestSchema);