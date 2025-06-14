// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inv-validation")
const utilities = require("../utilities/")

// Route to build inventory management view (PROTECTED - Employee/Admin only)
router.get("/", utilities.checkAccountType, invController.buildManagement);

// Route to build add classification view (PROTECTED - Employee/Admin only)
router.get("/add-classification", utilities.checkAccountType, invController.buildAddClassification);

// Route to process add classification form (PROTECTED - Employee/Admin only)
router.post("/add-classification", 
  utilities.checkAccountType,
  invValidate.addClassificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Route to build add inventory view (PROTECTED - Employee/Admin only)
router.get("/add-inventory", utilities.checkAccountType, invController.buildAddInventory);

// Route to process add inventory form (PROTECTED - Employee/Admin only)
router.post("/add-inventory", 
  utilities.checkAccountType,
  invValidate.addInventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// Route to build edit inventory view (PROTECTED - Employee/Admin only)
router.get("/edit/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.buildEditInventory));

// Route to process edit inventory form (PROTECTED - Employee/Admin only)
router.post("/edit/", 
  utilities.checkAccountType,
  invValidate.addInventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.updateInventory)
);

// Route to build delete inventory confirmation view (PROTECTED - Employee/Admin only)
router.get("/delete/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.buildDeleteInventory));

// Route to process delete inventory (PROTECTED - Employee/Admin only)
router.post("/delete/", utilities.checkAccountType, utilities.handleErrors(invController.deleteInventory));

// Route to build inventory by classification view (PUBLIC - accessible to all)
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build vehicle detail view (PUBLIC - accessible to all)
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInventoryId));

module.exports = router; 