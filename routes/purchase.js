const express = require('express')

const router = express.Router()
const purchaseController = require('../controller/purchase')
const userAuthentication = require('../middleware/auth')

router.get('/getpremium',userAuthentication.authenticate,purchaseController.purchasepremium)
router.post('/updatetransaction',userAuthentication.authenticate,purchaseController.updateTransactionStatus)

module.exports = router