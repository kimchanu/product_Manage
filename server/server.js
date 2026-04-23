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
const videoUploadRouter = require("./routes/videoUpload");
const userRoutes = require("./routes/user");
const predictionRouter = require("./routes/prediction");

const app = express();

app.use(cors());
// 동영상 업로드를 위해 200MB 이상으로 설정
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));

// 대용량 파일 업로드를 위한 타임아웃 설정 (10분)
app.use((req, res, next) => {
  if (req.path.includes('/api/video')) {
    req.setTimeout(10 * 60 * 1000); // 10분
    res.setTimeout(10 * 60 * 1000); // 10분
  }
  next();
});

// 모든 요청 로깅 (디버깅용)
app.use((req, res, next) => {
  if (req.path.includes('/materials/input/manual')) {
    console.log(`🔍 요청 받음: ${req.method} ${req.originalUrl}`);
  }
  next();
});

// API 라우트 등록
app.use("/api", register);
app.use("/api", loginRoute);
app.use("/api", protectedRoute);
app.use("/api/user", userRoutes);
app.use("/api/upload", uploadRouter);
// 더 구체적인 경로를 먼저 등록 (순서 중요)
app.use("/api/materials/output", outputRouter);
app.use("/api/materials/input", inputRouter);
app.use("/api/materials", materialRoutes);
app.use("/api/materials", require("./routes/product_list_edit"));

// 라우트 등록 확인
console.log("✅ inputRouter 등록됨: /api/materials/input");
app.use("/api/statistics/output", output_statistics);
app.use("/api/statistics/input", inputStatisticsRouter);
app.use("/api/statement", statement);
app.use("/api/yearlyStatement", yearlyStatement);
app.use("/api/budget", budgetRouter);
app.use("/api", outputApproveRouter);
app.use("/api/posts", postRouter);
app.use("/api/image", imageUploadRouter);
app.use("/api/video", videoUploadRouter);
app.use("/api/predictions", predictionRouter);

// 라우트 등록 확인 로그
console.log("✅ 라우트 등록 완료:");
console.log("  - POST /api/materials/input/manual");
console.log("  - GET /api/materials/input/manual");

// 등록되지 않은 라우트에 대한 404 핸들러
app.use((req, res, next) => {
  if (req.path.includes('/materials/input/manual')) {
    console.error(`❌ 라우트를 찾을 수 없음: ${req.method} ${req.originalUrl}`);
    console.error(`등록된 라우트 확인 필요`);
  }
  next();
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
