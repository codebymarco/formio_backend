const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSettingsSchema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    two_factor: {
      type: Boolean,
      required: true,
    },
    two_factor_email: {
      type: String,
    },
    passwordless: {
      type: Boolean,
      required: true,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("userSettings", userSettingsSchema);
