const express = require('express')
const router = express.Router()
const {getForm} = require('../controllers/scriptController')


router.get('/:id', getForm)

module.exports = router