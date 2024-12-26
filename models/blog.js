const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    date_created: {type: Date},
    author: {type: Schema.Types.ObjectId, ref: "Author", index:true},
    tags: [{type: String}],
    title: {type: String},
    body: {type: String},
    isPublished: {type:Boolean, index: true},
    publishReqStatus: {type: Number, index: true},
    votes: {type: Number},
    comments: [{type: Schema.Types.ObjectId, ref: "Comment" }]
});

BlogSchema.index({ title: "text", tags: "text" });

BlogSchema.virtual("url").get(function(){
    return `/blog/${this._id}`;
})

module.exports = mongoose.model("Blog", BlogSchema);