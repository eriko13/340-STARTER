const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const accountController = {}

/* ****************************************
 *  Deliver login view
 * *************************************** */
accountController.buildLogin = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    notice: req.flash("notice"),
    errors: null,
  });
}

/* ****************************************
 *  Deliver Account Management View
 * ************************************ */
accountController.buildAccountManagement = async function (req, res) {
  let nav = await utilities.getNav();
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    notice: req.flash("notice"),
  });
}

/* ****************************************
 *  Deliver update account view
 * ************************************ */
accountController.buildUpdateAccount = async function (req, res) {
  const nav = await utilities.getNav();
  const accountId = req.params.accountId;
  const accountData = res.locals.accountData;

  res.render("account/update-account", {
    title: "Update Account",
    nav,
    accountId,
    accountData,
    errors: null,
    notice: req.flash("notice"),
  });
}


/* ****************************************
*  Deliver registration view
* *************************************** */
accountController.buildRegister = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Registration",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver update account view
* *************************************** */
accountController.buildUpdateAccount = async function (req, res, next) {
  const account_id = parseInt(req.params.account_id)
  let nav = await utilities.getNav()

  // Verify that the user is updating their own account
  if (res.locals.accountData.account_id !== account_id) {
    req.flash("notice", "Access denied. You can only update your own account.")
    return res.redirect("/account/")
  }

  try {
    // Get fresh account data from database
    const accountData = await accountModel.getAccountById(account_id)

    if (accountData) {
      res.render("account/update-account", {
        title: "Update Account Information",
        nav,
        errors: null,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_id: accountData.account_id
      })
    } else {
      req.flash("notice", "Account not found.")
      res.redirect("/account/")
    }
  } catch (error) {
    req.flash("notice", "Error loading account information.")
    res.redirect("/account/")
  }
}

/* ****************************************
*  Process account information update
* *************************************** */
accountController.updateAccountInfo = async function (req, res) {
  const nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } =
    req.body;

  const result = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  );

  if (result) {
    const updatedAccountData = await accountModel.getAccountById(account_id);
    res.locals.accountData = updatedAccountData;
    req.flash("notice", "Account information successfully updated.");
    res.redirect("/account");
  } else {
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      accountId: account_id,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
}
/* ****************************************
*  Process password change
* *************************************** */
accountController.updatePassword = async function (req, res) {
  const nav = await utilities.getNav();
  const { account_id, account_password } = req.body;

  try {
    // Hash new password
    const hashedPassword = await bcrypt.hash(account_password, 10);

    // Update in database
    const updateResult = await accountModel.updatePassword(
      account_id,
      hashedPassword
    );

    if (updateResult) {
      const updatedAccountData = await accountModel.getAccountById(account_id);
      res.locals.accountData = updatedAccountData;
      req.flash("notice", "Password updated successfully.");
      return res.redirect("/account");
    } else {
      req.flash("notice", "Password update failed.");
      return res.status(501).render("account/update-account", {
        title: "Update Account",
        nav,
        accountId: account_id,
        errors: null,
      });
    }
  } catch (error) {
    console.error(error);
    req.flash("notice", "An error occurred while updating password.");
    return res.status(500).render("account/update-account", {
      title: "Update Account",
      nav,
      accountId: account_id,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
accountController.accountLogin = async function (req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash(
        "message notice",
        "Please check your credentials and try again."
      );
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}

/* ****************************************
*  Process Registration
* *************************************** */
accountController.registerAccount = async function (req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      notice: req.flash("notice"),
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      notice: req.flash("notice"),
      errors: null,
    });
  }
}

/* ****************************************
*  Process logout
* *************************************** */
accountController.accountLogout = async function (req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}

module.exports = accountController 