const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName: {type: String, required: true},
    userEmail: {type: String, required: true},
    isAdmin: {type: Boolean},
    isEditor: {type: Boolean},
    authorDetails: {type: Schema.Types.ObjectId, ref: "Author" },
    salt: {type: String, required: true},
    hash: {type: String, required: true},
    dateCreated: {type: Date},
    votedBlogs: [{type: Schema.Types.ObjectId, ref: "Blog"}],
    votedReqs: [{type: Schema.Types.ObjectId, ref: "BlogRequest"}],
    allComments: [{type: Schema.Types.ObjectId, ref: "Comment"}]
});

module.exports = mongoose.model("User", UserSchema);