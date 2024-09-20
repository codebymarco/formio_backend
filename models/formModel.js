const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const formSchema = new Schema(
  {
    user_id: { type: String, required: true },
    bgcolor: { type: String, required: true },
    fontcolor: { type: String, required: true },
    inputbgcolor: { type: String, required: true },
    btncolor: { type: String, required: true },
    btntxtcolor: { type: String, required: true },
    inputtxtcolor: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    title: { type: String, required: true },
    reply_email: { type: Boolean, required: true },
    reply_email_content: { type: String},
    premium: { type: Boolean, required: true },
    namefield: { type: Boolean, required: true },
    emailfield: { type: Boolean, required: true },
    bodyfield: { type: Boolean, required: true },
    status: { type: Boolean, required: true },
    theme: {type: String},
    custom: {type:Boolean},
    theme: {type:String}
  },
  { timestamps: true }
);

module.exports = mongoose.model("form", formSchema);
