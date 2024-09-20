const express = require("express");
const router = express.Router();
const {
  editUser,
  deleteUser,
  getUser,
  changePassword,
  checkPassword,
  editSettings,
  getUserSettings,
} = require("../controllers/userController");

const Auth = require("../middlewear/requireAuth");
router.use(Auth);

router.post("/edit/:id", editUser);

router.post("/setting/:id", editSettings);
router.get("/setting/:id", getUserSettings);

router.get("/:id", getUser);

router.delete("/:id", deleteUser);

router.post("/password/change/:id", changePassword);

// Check User Password
router.post("/password/check/:id", checkPassword);

module.exports = router;
