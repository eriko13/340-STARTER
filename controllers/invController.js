const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  
  // Get className - if there are vehicles, get it from data, otherwise get it from classification table
  let className
  if (data.length > 0) {
    className = data[0].classification_name
  } else {
    const classificationData = await invModel.getClassificationById(classification_id)
    className = classificationData ? classificationData.classification_name : "Unknown"
  }
  
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory Item Detail View
 * ************************** */
invCont.buildByInvId = async function(req, res, next) {
    const invId = req.params.invId
    const itemData = await invModel.getInventoryItemById(invId)
    const details = await utilities.buildItemDetailView(itemData)
    let nav = await utilities.getNav()

    res.render('./inventory/item-detail-view', {
      title: `${itemData.inv_make} ${itemData.inv_model}`,
      item: itemData,
      details,
      nav,
      notice: req.flash("notice"),
      errors: null
    })
}

/* ***************************
 *  Build Management View
 * ************************** */
invCont.buildManagementView = async function(req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList()

  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
    notice: req.flash("notice")
  });
};

// Show the Add Classification form
invCont.buildAddClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    classificationSelect,
    errors: null,
    notice: req.flash("notice")
  })
}

// Handle POST classification insert
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const result = await invModel.addClassification(classification_name)

  if (result) {
    req.flash("notice", `Successfully added "${classification_name}" classification.`)
    nav = await utilities.getNav() // refresh nav to include new classification
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      notice: req.flash("notice")
    })
  } else {
    req.flash("notice", "Failed to add classification.")
    res.status(500).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      classification_name,
      errors: null,
      notice: req.flash("notice")
    })
  }
}

// Show add inventory form
invCont.buildAddInventory = async function (req, res) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationList,
    errors: null,
    notice: req.flash("notice")
  })
}

// GET route for Inventory Edit View
invCont.buildEditInventoryView = async function(req, res, next) {
  let nav = await utilities.getNav();
  const invId = req.params.invId;
  // Retrieve the inventory item data using its id
  const itemData = await invModel.getInventoryItemById(invId);
  if (!itemData) {
    req.flash("notice", "Item not found");
    return res.redirect("/inv/");
  }

  const classificationList = await utilities.buildClassificationList(itemData.classification_id);
  // Render the edit view, passing along the item data and navigation
  res.render("./inventory/edit-inventory", {
    title: `Edit ${itemData.inv_make} ${itemData.inv_model}`,
    nav,
    classificationList,
    errors: null,
    ...itemData, // 👈 this makes inv_id, inv_make, etc. available directly
    notice: req.flash("notice")
  });
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryItemById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteConfirmationView = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryItemById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    notice: req.flash("notice"),
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price
  })
}

// Handle form POST
invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList(req.body.classification_id)
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  } = req.body

  const result = await invModel.addInventoryItem(
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  )

  if (result) {
    req.flash("notice", "Vehicle successfully added!")
    nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      notice: req.flash("notice")
    })
  } else {
    req.flash("notice", "Failed to add vehicle.")
    res.status(500).render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: null,
      notice: req.flash("notice"),
      ...req.body
    })
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationList = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
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
    classification_id,
    inv_id,
    notice: req.flash("notice")
    })
  }
}

/* ***************************
 *  Carry out delete inventory item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.body.inv_id)

  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("notice", "The inventory item was successfully deleted.")
    res.redirect("/inv/")
  } else {
    const itemData = await invModel.getInventoryItemById(inv_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    req.flash("notice", "Sorry, the delete failed.")
    res.status(500).render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      notice: req.flash("notice"),
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

module.exports = invCont;