const express = require("express");
const { registerOE, loginOE } = require("../Controller/OEController");
const TaskController = require("../Controller/TaskCtrl");

const router = express.Router();

router.post("/register", registerOE);
router.post("/login", loginOE);

// OE assigned tasks (forwarded by RM + direct assignments)
router.get("/assigned-tasks", (req, res) => {
  const oeId = req.query.oeId;
  req.params.oeId = oeId;
  return TaskController.getOEAssignedTasks(req, res);
});

// OE forward task back to RM (status, remark, files)
router.put("/forward-to-rm", TaskController.oeForwardToRM);

module.exports = router;
