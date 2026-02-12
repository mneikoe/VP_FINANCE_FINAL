const express = require("express");
const router = express.Router();

const {
  createMeetingPurpose,
  getAllMeetingPurposes,
  getMeetingPurposeById,
  updateMeetingPurpose,
  deleteMeetingPurpose,
} = require("../../Controller/Lead/MeetingPurposeCtrl");

router.post("/", createMeetingPurpose);
router.get("/", getAllMeetingPurposes);
router.get("/:id", getMeetingPurposeById);
router.put("/:id", updateMeetingPurpose);
router.delete("/:id", deleteMeetingPurpose);

module.exports = router;
