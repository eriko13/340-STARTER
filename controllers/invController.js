const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Process Add Classification
 * ************************** */
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const addResult = await invModel.addClassification(classification_name)

  if (addResult) {
    // Success - refresh navigation and redirect to management with success message
    nav = await utilities.getNav() // Get updated navigation
    req.flash("notice", `The ${classification_name} classification was successfully added.`)
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav
    })
  } else {
    // Failure - show error message
    req.flash("notice", "Sorry, adding the classification failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    })
  }
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: null,
  })
}

/* ***************************
 *  Process Add Inventory
 * ************************** */
invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav()
  const { 
    inv_make, inv_model, inv_year, inv_description, inv_image, 
    inv_thumbnail, inv_price, inv_miles, inv_color, classification_id 
  } = req.body

  const addResult = await invModel.addInventory(
    inv_make, inv_model, inv_year, inv_description, inv_image, 
    inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
  )

  if (addResult) {
    // Success - redirect to management with success message
    req.flash("notice", `The ${inv_year} ${inv_make} ${inv_model} was successfully added to inventory.`)
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav
    })
  } else {
    // Failure - show error message and re-render form
    let classificationList = await utilities.buildClassificationList(classification_id)
    req.flash("notice", "Sorry, adding the vehicle failed.")
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
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
  }
}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  
  // Validate classification_id is a valid number
  if (!classification_id || isNaN(classification_id)) {
    req.flash("notice", "Invalid classification ID.")
    return res.redirect("/")
  }
  
  try {
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    
    let className = "Unknown Classification"
    
    if (data && data.length > 0) {
      // If there are vehicles, get classification name from the first vehicle's data
      className = data[0].classification_name
    } else {
      // If no vehicles, get classification name from the classifications table
      const classifications = await invModel.getClassifications()
      const classification = classifications.rows.find(c => c.classification_id == classification_id)
      if (classification) {
        className = classification.classification_name
      } else {
        // Classification doesn't exist, handle error
        req.flash("notice", "Sorry, the requested classification was not found.")
        return res.redirect("/")
      }
    }
    
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } catch (error) {
    // Error getting inventory or classification data
    console.error("Error in buildByClassificationId:", error)
    req.flash("notice", "Sorry, there was an error loading the classification.")
    res.redirect("/")
  }
}

module.exports = invCont 