import mongoose from "mongoose";
const entrySchema=new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref:'User', required: true},
    title: {type: String, required: true},
    content: {type: String, required: true},
    images: {type: [String]},
},{timestamps: true});
const Entry=mongoose.model('Entry', entrySchema);
export default Entry;