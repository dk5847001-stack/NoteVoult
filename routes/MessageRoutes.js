const express = require("express");
const router = express.Router();
const AsyncWrap = require("../utils/AsyncWrap");
const MessageController = require("../controllers/MessageController");

router.route("/")
.get(AsyncWrap(MessageController.index))
.post(AsyncWrap(MessageController.createMessage))

router.delete("/:id", AsyncWrap(MessageController.deleteMessage));

module.exports = router;