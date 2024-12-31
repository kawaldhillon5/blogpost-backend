const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EditorReqSchema = new Schema({
    requestStatus: {type:Number},
    first_name:{type:String},
    last_name:{type:String},
    dateCreated: {type: Date},
    user: {type: Schema.Types.ObjectId, ref:"User"}
});

module.exports = mongoose.model("EditorReq", EditorReqSchema);
