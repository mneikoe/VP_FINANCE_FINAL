const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const officeDiaryCtrl = require("../Controller/OfficeDiaryCtrl");

const uploadFields = upload.fields([{ name: "diaryPdf", maxCount: 1 }]);

router.post("/", uploadFields, officeDiaryCtrl.createDiary);
router.get("/", officeDiaryCtrl.getAllDiaries);
router.get("/:id", officeDiaryCtrl.getDiaryById);
router.put("/update/:id", uploadFields, officeDiaryCtrl.updateDiary);
router.delete("/delete/:id", officeDiaryCtrl.deleteDiary);

module.exports = router;
