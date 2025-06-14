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

/* ***************************
 *  Build vehicle detail view (PUBLIC)
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inv_id
  
  // Validate inv_id is a valid number
  if (!inv_id || isNaN(inv_id)) {
    req.flash("notice", "Invalid vehicle ID.")
    return res.redirect("/")
  }
  
  try {
    const data = await invModel.getInventoryById(inv_id)
    if (data) {
      let nav = await utilities.getNav()
      res.render("./inventory/detail", {
        title: `${data.inv_make} ${data.inv_model}`,
        nav,
        vehicle: data,
      })
    } else {
      req.flash("notice", "Sorry, the requested vehicle was not found.")
      res.redirect("/")
    }
  } catch (error) {
    console.error("Error in buildByInventoryId:", error)
    req.flash("notice", "Sorry, there was an error loading the vehicle details.")
    res.redirect("/")
  }
}

/* ***************************
 *  Build edit inventory view (PROTECTED)
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inv_id = req.params.inv_id
  let nav = await utilities.getNav()
  
  try {
    const data = await invModel.getInventoryById(inv_id)
    if (data) {
      let classificationList = await utilities.buildClassificationList(data.classification_id)
      res.render("./inventory/edit-inventory", {
        title: `Edit ${data.inv_make} ${data.inv_model}`,
        nav,
        classificationList,
        errors: null,
        inv_id: data.inv_id,
        inv_make: data.inv_make,
        inv_model: data.inv_model,
        inv_year: data.inv_year,
        inv_description: data.inv_description,
        inv_image: data.inv_image,
        inv_thumbnail: data.inv_thumbnail,
        inv_price: data.inv_price,
        inv_miles: data.inv_miles,
        inv_color: data.inv_color,
        classification_id: data.classification_id
      })
    } else {
      req.flash("notice", "Sorry, the vehicle was not found.")
      res.redirect("/inv/")
    }
  } catch (error) {
    console.error("Error in buildEditInventory:", error)
    req.flash("notice", "Sorry, there was an error loading the edit form.")
    res.redirect("/inv/")
  }
}

/* ***************************
 *  Update inventory item (PROTECTED)
 * ************************** */
invCont.updateInventory = async function (req, res) {
  let nav = await utilities.getNav()
  const { 
    inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, 
    inv_thumbnail, inv_price, inv_miles, inv_color, classification_id 
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, 
    inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
  )

  if (updateResult) {
    req.flash("notice", `The ${inv_year} ${inv_make} ${inv_model} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    let classificationList = await utilities.buildClassificationList(classification_id)
    req.flash("notice", "Sorry, updating the vehicle failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: `Edit ${inv_year} ${inv_make} ${inv_model}`,
      nav,
      classificationList,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ***************************
 *  Build delete inventory confirmation view (PROTECTED)
 * ************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  const inv_id = req.params.inv_id
  let nav = await utilities.getNav()
  
  try {
    const data = await invModel.getInventoryById(inv_id)
    if (data) {
      res.render("./inventory/delete-confirm", {
        title: `Delete ${data.inv_make} ${data.inv_model}`,
        nav,
        errors: null,
        inv_id: data.inv_id,
        inv_make: data.inv_make,
        inv_model: data.inv_model,
        inv_year: data.inv_year,
        inv_price: data.inv_price
      })
    } else {
      req.flash("notice", "Sorry, the vehicle was not found.")
      res.redirect("/inv/")
    }
  } catch (error) {
    console.error("Error in buildDeleteInventory:", error)
    req.flash("notice", "Sorry, there was an error loading the delete confirmation.")
    res.redirect("/inv/")
  }
}

/* ***************************
 *  Delete inventory item (PROTECTED)
 * ************************** */
invCont.deleteInventory = async function (req, res) {
  const { inv_id, inv_make, inv_model, inv_year } = req.body

  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) {
    req.flash("notice", `The ${inv_year} ${inv_make} ${inv_model} was successfully deleted.`)
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, deleting the vehicle failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}

module.exports = invCont 