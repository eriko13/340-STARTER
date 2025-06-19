const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const errorController = require("../controllers/errorController");

// Wrap controller with error handler middleware
router.get("/error-test", utilities.handleErrors(errorController.throwError));

module.exports = router;