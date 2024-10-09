const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EditorReqSchema = new Schema({
    firstName: {type: String},
    lastName: {type:String},
    email: {type: String},
    dateCreated: {type: Date},
});

module.exports = mongoose.model("EditorReq", EditorReqSchema);
