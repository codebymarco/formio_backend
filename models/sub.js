const mongoose = require('mongoose')

const Schema = mongoose.Schema

const subSchema = new Schema({
    user_id:{
        type: String,
        required: true
    },
    plan:{
        type: String,
        required: true
    },
},
{timestamps: true})

module.exports = mongoose.model('sub', subSchema)