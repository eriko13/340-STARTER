const { body, validationResult } = require("express-validator")
const utilities = require(".")

/*  **********************************
 *  Classification Name Validation Rules
 * ********************************* */
const addClassificationRules = () => {
  return [
    // Classification name is required and must be string
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Classification name is required.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name cannot contain spaces or special characters."),
  ]
}

/* ******************************
 * Check data and return errors or continue to next
 * ***************************** */
const checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name,
    })
    return
  }
  next()
}

/*  **********************************
 *  Inventory Data Validation Rules
 * ********************************* */
const addInventoryRules = () => {
  return [
    // Make is required and must be string
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Make is required and must be at least 3 characters.")
      .matches(/^[A-Za-z\s\-]+$/)
      .withMessage("Make can only contain letters, spaces, and hyphens."),

    // Model is required
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Model is required."),

    // Year must be 4 digits
    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .matches(/^(19|20)\d{2}$/)
      .withMessage("Year must be a 4-digit year."),

    // Description is required
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Description is required."),

    // Image path is required
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required."),

    // Thumbnail path is required
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),

    // Price must be a positive number
    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),

    // Miles must be a positive integer
    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive integer."),

    // Color is required
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .matches(/^[A-Za-z\s]+$/)
      .withMessage("Color is required and can only contain letters and spaces."),

    // Classification is required
    body("classification_id")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .withMessage("Please select a classification."),
  ]
}

/* ******************************
 * Check inventory data and return errors or continue to next
 * ***************************** */
const checkInventoryData = async (req, res, next) => {
  const { 
    inv_make, inv_model, inv_year, inv_description, inv_image, 
    inv_thumbnail, inv_price, inv_miles, inv_color, classification_id 
  } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    })
    return
  }
  next()
}

module.exports = {
  addClassificationRules,
  checkClassificationData,
  addInventoryRules,
  checkInventoryData,
} 