const leadModel = require("../models/lead-model");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const leadCont = {};

/* ***************************
 *  Build leads management view
 * ************************** */
leadCont.buildLeadsManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  const leadsData = await leadModel.getAllLeads();
  
  res.render("./leads/management", {
    title: "Leads Management",
    nav,
    leads: leadsData.rows || [],
    notice: req.flash("notice"),
    errors: null
  });
};

/* ***************************
 *  Process lead submission
 * ************************** */
leadCont.submitLead = async function (req, res, next) {
  req.flash("notice");
  const { lead_name, lead_email, lead_phone, lead_message, inv_id } = req.body;
  const account_id = res.locals.loggedin ? res.locals.accountData.account_id : null;

  try {
    const result = await leadModel.createLead(
      lead_name,
      lead_email,
      lead_phone,
      lead_message,
      inv_id,
      account_id
    );

    if (result.rows) {
      res.redirect(`/inv/detail/${inv_id}`);
      req.flash("notice", "Thank you for your interest! Our sales team will contact you soon.");
    } else {
      res.redirect(`/inv/detail/${inv_id}`);
      req.flash("error", "There was an error submitting your inquiry. Please try again.");
    }
  } catch (error) {
    res.redirect(`/inv/detail/${inv_id}`);
    req.flash("error", "There was an error submitting your inquiry. Please try again.");
  }
};

/* ***************************
 *  Build lead detail view
 * ************************** */
leadCont.buildLeadDetail = async function (req, res, next) {
  const lead_id = req.params.leadId;
  const leadData = await leadModel.getLeadById(lead_id);
  let nav = await utilities.getNav();

  if (!leadData) {
    req.flash("notice", "Lead not found.");
    return res.redirect("/leads");
  }

  res.render("./leads/detail", {
    title: "Lead Details",
    nav,
    lead: leadData,
    notice: req.flash("notice"),
    errors: null
  });
};

/* ***************************
 *  Update lead status
 * ************************** */
leadCont.updateLeadStatus = async function (req, res, next) {
  const { lead_id, status } = req.body;

  try {
    const result = await leadModel.updateLeadStatus(lead_id, status);
    
    if (result.rowCount > 0) {
      req.flash("notice", "Lead status updated successfully.");
    } else {
      req.flash("notice", "Failed to update lead status.");
    }
  } catch (error) {
    req.flash("notice", "Error updating lead status.");
  }

  res.redirect("/leads");
};

/* ***************************
 *  Delete lead
 * ************************** */
leadCont.deleteLead = async function (req, res, next) {
  const lead_id = req.params.leadId;

  try {
    const result = await leadModel.deleteLead(lead_id);
    
    if (result.rowCount > 0) {
      req.flash("notice", "Lead deleted successfully.");
    } else {
      req.flash("notice", "Failed to delete lead.");
    }
  } catch (error) {
    req.flash("notice", "Error deleting lead.");
  }

  res.redirect("/leads");
};

module.exports = leadCont; 