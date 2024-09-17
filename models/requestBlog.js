const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RequestBlogSchema = new Schema({
    date_created: {type: String},
    title: {type: String, required: true},
    desc: {type: String},
    votes: {type: Number},
    user: {type: String},
});

RequestBlogSchema.virtual("url").get(function(){
    return `/requestBlog/${this._id}`;
});

module.exports = mongoose.model("RequestBlog", RequestBlogSchema);