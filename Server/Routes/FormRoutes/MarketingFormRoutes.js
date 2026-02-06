const express = require("express");
const upload = require("../../config/uploadForm");

const {
  createMarketingForm,
  getAllMarketingForms,
  getFormsByKindOfForm,
  updateMarketingForm,
  deleteMarketingForm,
} = require("../../Controller/FormController/MarketingFormsCtrl");

const router = express.Router();

/**
 * CREATE FORM
 */
router.post(
  "/",
  upload.single("file"),
  createMarketingForm
);

/**
 * GET ALL FORMS
 */
router.get("/", getAllMarketingForms);

/**
 * GET FORMS BY KIND OF FORM
 */
router.get(
  "/kind/:kindOfForm",
  getFormsByKindOfForm
);

/**
 * UPDATE FORM
 */
router.put(
  "/:id",
  upload.single("file"),
  updateMarketingForm
);

/**
 * DELETE FORM
 */
router.delete("/:id", deleteMarketingForm);

module.exports = router;
