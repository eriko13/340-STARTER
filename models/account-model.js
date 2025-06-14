const pool = require("../database/")

const accountModel = {}

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Get account data by account_id
 * ************************** */
accountModel.getAccountById = async function (account_id) {
  try {
    const data = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1',
      [account_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getAccountById error " + error)
    return error.message
  }
}

/* ***************************
 *  Get account data by email (for checking email uniqueness)
 * ************************** */
accountModel.getAccountByEmail = async function (account_email) {
  try {
    const data = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getAccountByEmail error " + error)
    return error.message
  }
}

/* ***************************
 *  Update account information (firstname, lastname, email)
 * ************************** */
accountModel.updateAccount = async function (account_firstname, account_lastname, account_email, account_id) {
  try {
    const sql = `UPDATE account 
      SET account_firstname = $1, account_lastname = $2, account_email = $3 
      WHERE account_id = $4 RETURNING *`
    const data = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
    return data.rows[0]
  } catch (error) {
    console.error("updateAccount error " + error)
    return error.message
  }
}

/* ***************************
 *  Update account password
 * ************************** */
accountModel.updatePassword = async function (hashedPassword, account_id) {
  try {
    const sql = `UPDATE account 
      SET account_password = $1 
      WHERE account_id = $2 RETURNING account_id`
    const data = await pool.query(sql, [hashedPassword, account_id])
    return data.rows[0]
  } catch (error) {
    console.error("updatePassword error " + error)
    return error.message
  }
}

accountModel.registerAccount = registerAccount

module.exports = accountModel 