const express = require('express')
const expenseController = require('../controller/expense')
const userAuthentication = require('../middleware/auth')

const router = express.Router()

router.post('/addexpense',userAuthentication.authenticate,expenseController.addExpense)
router.get('/getexpense',userAuthentication.authenticate,expenseController.getExpense)
router.delete('/deleteexpense/:expenseid',userAuthentication.authenticate,expenseController.deleteExpense)
router.get('/myexpense',userAuthentication.authenticate,expenseController.getUserExpense)

module.exports= router