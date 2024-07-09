const mongoose = require('mongoose')

const Schema = mongoose.Schema

const twoFactorVerifyEmailSchema = new Schema({
    code:{
        type: String,
        required: true
    },
    user_id:{
        type: String,
        required: true
    },
    expiresAt:{
        type: Date,
        required: true
    },
    used:{
        type: Boolean,
        required: true
    },
},
{timestamps: true})

module.exports = mongoose.model('twoFactorVerifyEmail', twoFactorVerifyEmailSchema)