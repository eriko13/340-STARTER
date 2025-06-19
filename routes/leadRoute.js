// Needed Resources 
const express = require("express");
const router = new express.Router();
const leadController = require("../controllers/leadController");
const utilities = require("../utilities");
const leadValidate = require("../utilities/lead-validation");

// Route to build leads management view (Employee/Admin only)
router.get("/", 
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(leadController.buildLeadsManagement)
);

// Route to view lead details (Employee/Admin only)
router.get("/detail/:leadId", 
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(leadController.buildLeadDetail)
);

// Route to submit a new lead (any visitor)
router.post("/submit", 
  leadValidate.leadRules(),
  leadValidate.checkLeadData,
  utilities.handleErrors(leadController.submitLead)
);

// Route to update lead status (Employee/Admin only)
router.post("/update-status", 
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(leadController.updateLeadStatus)
);

// Route to delete lead (Employee/Admin only)
router.get("/delete/:leadId", 
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(leadController.deleteLead)
);

module.exports = router; 