const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    date_created: {type: Date},
    author: {type: Schema.Types.ObjectId, ref: "Author"},
    tags: [{type: String}],
    content: {type: String}
})

BlogSchema.virtual("url").get(function(){
    return `/blogs/${this._id}`;
})

module.exports = mongoose.model("Blog", BlogSchema);