const express = require('express')
const router = express.Router()
const baseController = require('../controllers/baseController')
const utilities = require('../utilities')

// Route to home page
router.get('/', utilities.handleErrors(baseController.buildHome))

module.exports = router 