const mongoose = require('mongoose')

const Schema = mongoose.Schema

const resetPasswordTokenSchema = new Schema({
    token:{
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
},
{timestamps: true})

module.exports = mongoose.model('resetPasswordToken', resetPasswordTokenSchema)