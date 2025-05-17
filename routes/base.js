const express = require('express')
const router = express.Router()
const baseController = require('../controllers/baseController')

// Route to home page
router.get('/', baseController.buildHome)

module.exports = router 