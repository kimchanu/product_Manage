require('dotenv').config();
const express = require("express");
const cors = require("cors");
const register = require("./routes/register");
const loginRoute = require("./routes/login");
const protectedRoute = require("./routes/protected");
const uploadRouter = require("./routes/upload");
const materialRoutes = require("./routes/material");
const outputRouter = require("./routes/output");
const output_statistics = require("./routes/output_statistics");
const inputStatisticsRouter = require("./routes/inputStatistics");
const statement = require("./routes/statement");
const yearlyStatement = require("./routes/yearlyStatement");
const inputRouter = require("./routes/input");
const budgetRouter = require("./routes/budget");
const outputApproveRouter = require("./routes/output_approve");
const postRouter = require("./routes/post");
const imageUploadRouter = require("./routes/imageUpload");

const app = express();

app.use(cors());
app.use(express.json({ limit: "500mb" })); // ✅ JSON 크기 제한 100MB로 증가
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

// API 라우트 등록
app.use("/api", register);
app.use("/api", loginRoute);
app.use("/api", protectedRoute);
app.use("/api/upload", uploadRouter);
// 더 구체적인 경로를 먼저 등록 (순서 중요)
app.use("/api/materials/output", outputRouter);
app.use("/api/materials/input", inputRouter);
app.use("/api/materials", materialRoutes);
app.use("/api/materials", require("./routes/product_list_edit"));
app.use("/api/statistics/output", output_statistics);
app.use("/api/statistics/input", inputStatisticsRouter);
app.use("/api/statement", statement);
app.use("/api/yearlyStatement", yearlyStatement);
app.use("/api/budget", budgetRouter);
app.use("/api", outputApproveRouter);
app.use("/api/posts", postRouter);
app.use("/api/image", imageUploadRouter);
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));