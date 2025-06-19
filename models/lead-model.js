const pool = require("../database/");

/* *****************************
 *   Create new lead
 * *************************** */
async function createLead(lead_name, lead_email, lead_phone, lead_message, inv_id, account_id = null) {
  try {
    const sql = `
      INSERT INTO leads (lead_name, lead_email, lead_phone, lead_message, inv_id, account_id) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    return await pool.query(sql, [lead_name, lead_email, lead_phone, lead_message, inv_id, account_id]);
  } catch (error) {
    return error.message;
  }
}

/* *****************************
 *   Get all leads with vehicle info
 * *************************** */
async function getAllLeads() {
  try {
    const sql = `
      SELECT l.*, i.inv_make, i.inv_model, i.inv_year, a.account_firstname, a.account_lastname
      FROM leads l
      LEFT JOIN inventory i ON l.inv_id = i.inv_id
      LEFT JOIN account a ON l.account_id = a.account_id
      ORDER BY l.lead_created_date DESC
    `;
    return await pool.query(sql);
  } catch (error) {
    return error.message;
  }
}

/* *****************************
 *   Get lead by ID
 * *************************** */
async function getLeadById(lead_id) {
  try {
    const sql = `
      SELECT l.*, i.inv_make, i.inv_model, i.inv_year, i.inv_price, a.account_firstname, a.account_lastname
      FROM leads l
      LEFT JOIN inventory i ON l.inv_id = i.inv_id
      LEFT JOIN account a ON l.account_id = a.account_id
      WHERE l.lead_id = $1
    `;
    const result = await pool.query(sql, [lead_id]);
    return result.rows[0];
  } catch (error) {
    return error.message;
  }
}

/* *****************************
 *   Update lead status
 * *************************** */
async function updateLeadStatus(lead_id, status) {
  try {
    const sql = `
      UPDATE leads 
      SET lead_status = $1 
      WHERE lead_id = $2
    `;
    return await pool.query(sql, [status, lead_id]);
  } catch (error) {
    return error.message;
  }
}

/* *****************************
 *   Delete lead
 * *************************** */
async function deleteLead(lead_id) {
  try {
    const sql = "DELETE FROM leads WHERE lead_id = $1";
    return await pool.query(sql, [lead_id]);
  } catch (error) {
    return error.message;
  }
}

module.exports = { 
  createLead, 
  getAllLeads, 
  getLeadById, 
  updateLeadStatus, 
  deleteLead 
}; 