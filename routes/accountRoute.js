// Needed Resources 
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const accountValidate = require("../utilities/account-validation")
const utilities = require("../utilities/")

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to handle login attempt
router.post(
  "/login", 
  utilities.handleErrors(accountController.accountLogin),
  utilities.checkJWTToken,
)

// Process the registration data
router.post(
  "/register",
  accountValidate.registationRules(),
  accountValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Route to build account management view (protected)
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount))

// Route to build update account view (protected)
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccount))

// Route to process account information update (protected)
router.post("/update-info/",
  utilities.checkLogin,
  accountValidate.updateAccountRules(),
  accountValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccountInfo)
)

// Route to process password change (protected)
router.post("/update-password/",
  utilities.checkLogin,
  accountValidate.updatePasswordRules(),
  accountValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

// Route to handle logout
router.get("/logout", utilities.handleErrors(accountController.accountLogout))

module.exports = router 