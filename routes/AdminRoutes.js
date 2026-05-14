const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/AdminController");
const isAdmin = require("../middlewares/AdminMiddleware");

router.get("/", isAdmin, AdminController.index);

router.get("/block/:id", isAdmin, AdminController.blockUser);

router.get("/unblock/:id", isAdmin, AdminController.unblockUser);

router.get("/user/:id", isAdmin, AdminController.viewUserDetails);

router.delete("/delete/:id", isAdmin, AdminController.deleteUser);

module.exports = router;