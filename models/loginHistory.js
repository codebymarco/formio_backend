const mongoose = require('mongoose')

const Schema = mongoose.Schema

const loginHistorySchema = new Schema({
    user_id:{
        type: String,
        required: true
    },
    login:{
        type:String,
        required: true
    },
},
{timestamps: true})

module.exports = mongoose.model('loginHistorySchema', loginHistorySchema)