const express = require('express')
const router = express.Router()
const {getUserRecoveryCode,createUserRecoveryCode,twoFactorSendVerifyEmail} = require('../controllers/securityController')


const Auth = require("../middlewear/requireAuth");
router.use(Auth);
router.get('/recoverycode/:id', getUserRecoveryCode)

router.post('/recoverycode/:id', createUserRecoveryCode)

module.exports = router

