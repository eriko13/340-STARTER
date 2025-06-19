const utilities = require(".")
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")

const validate = {}

/*  **********************************
 *  Account Update Validation Rules
 * ********************************* */
validate.updateAccountRules = () => {
  return [
    // First name is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("First name is required."),

    // Last name is required
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Last name is required."),

    // Valid email is required and must be unique if changed
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        // Check if email already exists for a different account
        const existingAccount = await accountModel.getAccountByEmail(account_email)
        if (existingAccount) {
          throw new Error("Email exists. Please use a different email address.")
        }
      }),
  ]
}

/* **********************************
 *  Check inventory update data and return errors
 * ********************************* */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  const classificationList = await utilities.buildClassificationList(
    req.body.classification_id
  );
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("./inventory/edit-inventory", {
      title: "Edit " + req.body.inv_make + " " + req.body.inv_model,
      nav,
      classificationList,
      errors,
      notice: req.flash("notice"),
      inv_id: req.body.inv_id,
      ...req.body,
    });
    return;
  }
  next();
};

/* **********************************
 *  Account Update Validation Rules
 * ********************************* */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .notEmpty()
      .withMessage("First name is required."),

    body("account_lastname")
      .trim()
      .notEmpty()
      .withMessage("Last name is required."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required.")
      .custom(async (value, { req }) => {
        const existing = await accountModel.getAccountByEmail(value);
        if (existing && existing.account_id != req.body.account_id) {
          throw new Error("Email already in use.");
        }
      }),
  ];
};

/* ******************************
 * Check account update data and return errors or continue to next
 * ***************************** */
validate.checkUpdateAccountData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update-account", {
      errors,
      title: "Update Account Information",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    })
    return
  }
  next()
}

/*  **********************************
 *  Password Update Validation Rules
 * ********************************* */
validate.updatePasswordRules = () => {
  return [
    // Password must be strong
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character."),
  ]
}

/* ******************************
 * Check password data and return errors or continue to next
 * ***************************** */
validate.checkUpdatePasswordData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors,
      accountId: req.body.account_id,
    });
    return;
  }
  next();
};


/* ******************************
 * Check password data and return errors or continue to next
 * ***************************** */
validate.checkPasswordData = async (req, res, next) => {
  const { account_password, account_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()

    // Get current account data to populate the form
    const accountData = await accountModel.getAccountById(account_id)

    res.render("account/update-account", {
      errors,
      title: "Update Account Information",
      nav,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id,
    })
    return
  }
  next()
}

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the database
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(
          account_email
        );
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email");
        }
      }),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};


/* ******************************
 * Check login data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  const errors = validationResult(req);
  console.log("The errors:", errors.array());
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      notice: null,
      account_email,
    });
    return;
  }
  next();
};

/* ***********************************
 *  Classification Validation Rules
 * ********************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Classification name is required.")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage(
        "Classification name must not contain spaces or special characters."
      ),
  ];
};

validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors,
      classification_name,
      notice: req.flash("notice"),
    });
    return;
  }

  next();
};

validate.inventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Please choose a classification."),
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year").isInt({ min: 1886 }).withMessage("Enter a valid year."),
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),
    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive number."),
    body("inv_color").trim().notEmpty().withMessage("Color is required."),
  ];
};

validate.newInventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Please choose a classification."),
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year").isInt({ min: 1886 }).withMessage("Enter a valid year."),
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),
    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive number."),
    body("inv_color").trim().notEmpty().withMessage("Color is required."),
  ];
};

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  const classificationList = await utilities.buildClassificationList(
    req.body.classification_id
  );
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors,
      notice: req.flash("notice"),
      ...req.body,
    });
    return;
  }
  next();
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};


module.exports = validate 