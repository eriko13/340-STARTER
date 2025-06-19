const utilities = require(".");
const { body, validationResult } = require("express-validator");

const validate = {};

/*  **********************************
 *  Lead Data Validation Rules
 * ********************************* */
validate.leadRules = () => {
  return [
    // Full name is required and must be string
    body("lead_name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Please provide a valid name (at least 2 characters)."),

    // Valid email is required
    body("lead_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    // Phone is optional but if provided, should be valid format
    body("lead_phone")
      .trim()
      .optional({ checkFalsy: true })
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage("Please provide a valid phone number."),

    // Message is optional
    body("lead_message")
      .trim()
      .optional({ checkFalsy: true })
      .isLength({ max: 1000 })
      .withMessage("Message must be less than 1000 characters."),

    // inv_id is required and must be integer
    body("inv_id")
      .isInt({ min: 1 })
      .withMessage("Invalid vehicle selection.")
  ];
};

/* ******************************
 * Check data and return errors or continue to next process
 * ***************************** */
validate.checkLeadData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const inv_id = req.body.inv_id;
    req.flash("error", "Please correct the errors and try again.");
    return res.redirect(`/inv/detail/${inv_id}`);
  }
  next();
};

module.exports = validate; 