const express = require("express");
const router = express.Router();
const registrarController = require("../Controller/RegistrarCtrl");

// Create Registrar
router.post("/", registrarController.createRegistrar);

// Read all Registrars
router.get("/", registrarController.getAllRegistrars);

// Read single Registrar by ID
router.get("/:id", registrarController.getRegistrarById);

// Update Registrar by ID
router.put("/:id", registrarController.updateRegistrar);

// Delete Registrar by ID
router.delete("/:id", registrarController.deleteRegistrar);

module.exports = router;
