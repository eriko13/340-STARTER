const bcrypt = require("bcryptjs");
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    notice: req.flash("notice"),
    errors: null,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver Account Management View
 * ************************************ */
async function buildAccountManagement(req, res) {
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
async function buildUpdateAccount(req, res) {
  const nav = await utilities.getNav();
  const accountId = req.params.accountId;
  let accountData = res.locals.accountData;
  
  // If no account data in locals, fetch from database
  if (!accountData) {
    accountData = await accountModel.getAccountById(accountId);
  }

  res.render("account/update-account", {
    title: "Update Account",
    nav,
    account_id: accountId,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    errors: null,
    notice: req.flash("notice"),
  });
}

async function updateAccountInfo(req, res) {
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
      account_id: account_id,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
}

async function updatePassword(req, res) {
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
      const accountData = await accountModel.getAccountById(account_id);
      return res.status(501).render("account/update-account", {
        title: "Update Account",
        nav,
        account_id: account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        errors: null,
      });
    }
  } catch (error) {
    console.error(error);
    req.flash("notice", "An error occurred while updating password.");
    const accountData = await accountModel.getAccountById(account_id);
    return res.status(500).render("account/update-account", {
      title: "Update Account",
      nav,
      account_id: account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
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
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
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

async function logoutAccount(req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have successfully logged out.");
  return res.redirect("/");
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildUpdateAccount,
  updateAccountInfo,
  updatePassword,
  logoutAccount,
};
