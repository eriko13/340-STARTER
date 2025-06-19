exports.throwError = async function (req, res, next) {
    // Intentionally throw an error for testing purposes
    throw new Error("Intentional error for testing purposes.");
  };