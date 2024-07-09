const express = require('express')
const router = express.Router()
const {sendMessage} = require('../controllers/messageController')


router.post('/:id', sendMessage)

module.exports = router