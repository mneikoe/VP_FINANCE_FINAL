const express = require("express");
const uploadForm = require("../../config/uploadForm");

const {
  createServicingForm,
  getServicingForms,
  getServicingFormsByKind,
  updateServicingForm,
  deleteServicingForm,
} = require(
  "../../Controller/FormController/ServicingFormsctrl"
);

const router = express.Router();

router.post("/", uploadForm.single("file"), createServicingForm);
router.get("/kind/:kindOfForm", getServicingFormsByKind);
router.get("/", getServicingForms);
router.put("/:id", uploadForm.single("file"), updateServicingForm);
router.delete("/:id", deleteServicingForm);

module.exports = router;
