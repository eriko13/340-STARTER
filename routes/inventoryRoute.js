// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inv-validation")
const utilities = require("../utilities/")

// Route to build inventory management view
router.get("/", invController.buildManagement);

// Route to build add classification view
router.get("/add-classification", invController.buildAddClassification);

// Route to process add classification form
router.post("/add-classification", 
  invValidate.addClassificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Route to build add inventory view
router.get("/add-inventory", invController.buildAddInventory);

// Route to process add inventory form
router.post("/add-inventory", 
  invValidate.addInventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

module.exports = router; 