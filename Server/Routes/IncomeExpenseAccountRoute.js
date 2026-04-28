const router = require("express").Router();
const controller = require("../Controller/IncomeExpenseAccountController");

router.post("/", controller.createAccount);
router.get("/", controller.getAccounts);
router.get("/dropdown", controller.dropdownAccounts);
router.get("/:id", controller.getAccountById);
router.put("/:id", controller.updateAccount);
router.delete("/:id", controller.deleteAccount);
router.delete("/permanent/:id", controller.deleteAccountPermanent);

module.exports = router;