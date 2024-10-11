const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EditorReqSchema = new Schema({
    firstName: {type: String},
    lastName: {type:String},
    email: {type: String},
    dateCreated: {type: Date},
    user: {type: Schema.Types.ObjectId, ref:"User"}
});

module.exports = mongoose.model("EditorReq", EditorReqSchema);
