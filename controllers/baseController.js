const baseController = {}

baseController.buildHome = async function(req, res){
  try {
    res.render("index")
  } catch (error) {
    console.error("Error building home page:", error)
    res.status(500).render("error", { message: "Error building home page" })
  }
}

module.exports = baseController 