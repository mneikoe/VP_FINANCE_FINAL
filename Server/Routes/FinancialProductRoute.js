const express = require("express");
const router = express.Router();
const controller = require("../Controller/FinancialProductCtrl");

router.post("/", controller.createProduct); // Create
router.get("/", controller.getProducts); // Read all
router.get("/:id", controller.getProductById); // get by Id
router.put("/:id", controller.updateProduct); // Update
router.delete("/:id", controller.deleteProduct); // Delete

module.exports = router;
