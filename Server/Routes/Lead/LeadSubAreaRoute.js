const express = require("express");
const router = express.Router();
const subAreaCtrl = require("../../Controller/Lead/SubAreaCtrl");

router.get("/", subAreaCtrl.getAllSubAreas);
router.post("/", subAreaCtrl.createSubArea);
router.put("/:id", subAreaCtrl.updateSubArea);
router.delete("/delete/:id", subAreaCtrl.deleteSubArea);

module.exports = router;
