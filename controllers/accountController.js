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
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver account management view
* *************************************** */
accountController.buildAccount = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
  })
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
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body

  // Verify that the user is updating their own account
  if (res.locals.accountData.account_id !== parseInt(account_id)) {
    req.flash("notice", "Access denied. You can only update your own account.")
    return res.redirect("/account/")
  }

  try {
    // Update account information in database
    const updateResult = await accountModel.updateAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_id
    )

    if (updateResult && !updateResult.message) {
      // Success - get updated account data
      const updatedAccountData = await accountModel.getAccountById(account_id)

      if (updatedAccountData) {
        // Update JWT token with new account data
        const newAccountData = {
          account_id: updatedAccountData.account_id,
          account_firstname: updatedAccountData.account_firstname,
          account_lastname: updatedAccountData.account_lastname,
          account_email: updatedAccountData.account_email,
          account_type: updatedAccountData.account_type
        }

        const accessToken = jwt.sign(
          newAccountData,
          process.env.ACCESS_TOKEN_SECRET || 'fallback-jwt-secret',
          { expiresIn: 3600 * 1000 }
        )

        // Update cookie with new JWT token
        if (process.env.NODE_ENV === 'development') {
          res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
        } else {
          res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
        }

        req.flash("notice", "Account information has been updated successfully.")
      } else {
        req.flash("notice", "Account updated but there was an error retrieving the updated information.")
      }
    } else {
      req.flash("notice", "Sorry, the account update failed.")
    }
  } catch (error) {
    req.flash("notice", "Sorry, there was an error updating your account.")
  }

  res.redirect("/account/")
}

/* ****************************************
*  Process password change
* *************************************** */
accountController.updatePassword = async function (req, res) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body

  // Verify that the user is updating their own account
  if (res.locals.accountData.account_id !== parseInt(account_id)) {
    req.flash("notice", "Access denied. You can only update your own account.")
    return res.redirect("/account/")
  }

  try {
    // Hash the new password
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(account_password, 12)
    } catch (error) {
      req.flash("notice", "Password hashing failed. Please try again.")
      return res.redirect(`/account/update/${account_id}`)
    }

    // Update password in database
    const updateResult = await accountModel.updatePassword(hashedPassword, account_id)

    if (updateResult && !updateResult.message) {
      req.flash("notice", "Password has been changed successfully.")
    } else {
      req.flash("notice", "Sorry, the password update failed.")
    }
  } catch (error) {
    req.flash("notice", "Sorry, there was an error updating your password.")
  }

  res.redirect("/account/")
}

/* ****************************************
*  Process login attempt
* *************************************** */
accountController.accountLogin = async function (req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  try {
    // Get account from database by email
    const accountData = await accountModel.getAccountByEmail(account_email)

    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email
      })
      return
    }

    // Compare provided password with hashed password from database
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)

    if (passwordMatch) {
      delete accountData.account_password
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET || 'fallback-jwt-secret',
        { expiresIn: 3600 * 1000 }
      )
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    req.flash("notice", "Sorry, there was an error processing your login.")
    res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email
    })
  }
}

/* ****************************************
*  Process Registration
* *************************************** */
accountController.registerAccount = async function(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
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