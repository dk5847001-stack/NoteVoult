const express = require("express");
const router = express.Router();
const Subscriber = require("../models/Subscriber");
const SubscriberController = require("../controllers/SubscriberController");
const isLoggedIn = require("../middlewares/AuthMiddleware");
const isAdmin = require("../middlewares/AdminMiddleware");
const AsyncWrap = require("../utils/AsyncWrap");

router.route("/")
.get(isLoggedIn, isAdmin, AsyncWrap(SubscriberController.index))
.post(AsyncWrap(SubscriberController.newSubscriber))

module.exports = router;