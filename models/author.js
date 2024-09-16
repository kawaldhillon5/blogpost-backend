const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    first_name: {type: String},
    last_name:  {type: String},
    blogs: [{type: Schema.Types.ObjectId, ref: "Blog"}]
});

AuthorSchema.virtual("url").get(function(){
    return `/author/${this._id}`;
});

module.exports = mongoose.model("Author", AuthorSchema);