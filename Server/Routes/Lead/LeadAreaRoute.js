const express = require("express");
const router = express.Router();
const areaCtrl = require("../../Controller/Lead/LeadAreaCtrl");

router.post("/", areaCtrl.createArea);
router.get("/", areaCtrl.getAllAreas);
router.get("/:id", areaCtrl.getAreaById);
router.put("/:id", areaCtrl.updateArea);
router.delete("/delete/:id", areaCtrl.deleteArea);

module.exports = router;
