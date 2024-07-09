const express = require('express')
const router = express.Router()
const {createForm, editForm, getForm, deleteForm, getForms} = require('../controllers/formController')

const Auth = require('../middlewear/requireAuth')
router.use(Auth)

router.post('/', createForm)

router.delete('/:id', deleteForm)

router.put('/edit/:id', editForm)

router.get('/:id', getForm)

router.get('/all/:id', getForms)

module.exports = router