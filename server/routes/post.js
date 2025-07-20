const express = require("express");
const router = express.Router();

// 각 기능별 라우터 import
const postRoutes = require("./postRoutes");
const reactionRoutes = require("./reactionRoutes");
const commentRoutes = require("./commentRoutes");

// 라우터 연결
router.use("/", postRoutes);
router.use("/", reactionRoutes);
router.use("/", commentRoutes);

module.exports = router; 