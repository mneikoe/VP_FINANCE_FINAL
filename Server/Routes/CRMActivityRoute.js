const express = require("express");
const upload = require("../config/multer");
const controller = require("../Controller/CRMActivityCtrl");

const router = express.Router();

router.get("/", controller.getCRMActivities);
router.post("/", upload.single("attachment"), controller.createCRMActivity);
router.put("/:id", upload.single("attachment"), controller.updateCRMActivity);
router.patch(
  "/:id/upload",
  upload.single("attachment"),
  controller.uploadCRMActivityAttachment
);
router.delete("/:id", controller.deleteCRMActivity);

module.exports = router;
