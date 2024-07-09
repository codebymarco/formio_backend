const express = require('express')
const router = express.Router()
const {createUser, loginUser,PasswordLessLogin,TwoFactor, Send2factorEmail,checkEmail} = require('../controllers/authController')

router.post('/login', loginUser)

router.post('/login/checkemail', checkEmail)


router.post('/login/2factor', TwoFactor)

router.post('/login/2factor/send', Send2factorEmail)


router.post('/create', createUser)

router.post('/login/pwdless', PasswordLessLogin)


module.exports = router