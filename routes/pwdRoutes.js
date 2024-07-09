const express = require('express')
const router = express.Router()
const {sendMessage, resetPassword,sendEmailLogin} = require('../controllers/pwdController')


router.get('/sendemail/:email', sendMessage)

router.post('/reset/token', resetPassword)

router.get('/sendpwdlessemail/:email',sendEmailLogin )


module.exports = router