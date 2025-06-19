// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const validate = require("../utilities/account-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// New route for Inventory Item Details
router.get("/detail/:invId", invController.buildByInvId);

// New route to build Management view
router.get(
  "/",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.buildManagementView)
);

// Show the form to add a classification
router.get(
  "/add-classification",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassification)
);

// Handle form submission
router.post(
  "/add-classification",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  validate.classificationRules(),
  validate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Show the form
router.get(
  "/add-inventory",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddInventory)
);

// Handle the form submission
router.post(
  "/add-inventory",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  validate.inventoryRules(),
  validate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

// GET route to present the inventory edit view for a specific item
router.get(
  "/edit/:invId",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.buildEditInventoryView)
);

// POST route to update an existing inventory item.
// This route uses newInventoryRules() and checkUpdateData middleware so that
// the update data meets the same validation requirements as the add process,
// and in case of errors, redirects back to the edit view.
router.post(
  "/edit-inventory",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  validate.newInventoryRules(),
  validate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Get route to display delete confirmation view for a specific inventory item
router.get(
  "/delete/:invId",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.buildDeleteConfirmationView)
);

// Post route to handle the actual deletion of an inventory item
router.post(
  "/delete/:invId",
  utilities.checkLogin,
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventoryItem)
);

module.exports = router;
