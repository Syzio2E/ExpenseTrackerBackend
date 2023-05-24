const express = require('express');
const resetpasswordController = require('../controller/forgotpassword');
const router = express.Router();

router.post('/updatepassword/:resetpasswordid', resetpasswordController.updatepassword);
router.get('/resetpassword/:id', resetpasswordController.resetpassword);
router.post('/password/forgotpassword', resetpasswordController.forgotpassword);

module.exports = router;