const mongoose = require('mongoose')

const Schema = mongoose.Schema

const recCodeSchema = new Schema({
    code:{
        type: String,
        required: true
    },
    user_id:{
        type: String,
        required: true
    },
    used:{
        type: Boolean,
        required: true
    },
    current:{
        type: Boolean,
        required: true
    },
},
{timestamps: true})

module.exports = mongoose.model('recCode', recCodeSchema)