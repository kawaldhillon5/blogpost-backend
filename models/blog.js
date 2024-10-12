const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    date_created: {type: Date},
    author: {type: Schema.Types.ObjectId, ref: "Author"},
    tags: [{type: String}],
    title: {type: String},
    body: {type: String},
    isPublished: {type:Boolean}
})

BlogSchema.virtual("url").get(function(){
    return `/blog/${this._id}`;
})

module.exports = mongoose.model("Blog", BlogSchema);