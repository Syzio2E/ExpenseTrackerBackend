const express = require('express')
const userController = require('../controller/user')
const authController = require('../middleware/auth')

const router  = express.Router()

router.post('/signup',userController.signup)
router.post('/login',userController.login)
router.get('/checkpremium',authController.authenticate,userController.checkPremiumStatus)

module.exports = router