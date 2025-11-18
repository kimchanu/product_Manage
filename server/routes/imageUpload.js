const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sequelize = require("../db2");

// 업로드 디렉토리 생성
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 파일명 중복 방지를 위해 타임스탬프 추가
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB 제한
    },
    fileFilter: function (req, file, cb) {
        // 이미지 파일만 허용
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
        }
    }
});

// 이미지 업로드
router.post("/", upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "이미지 파일이 없습니다." });
        }

        // 데이터베이스에 이미지 정보 저장
        const [result] = await sequelize.query(`
            INSERT INTO post_image (filename, original_name, file_path, file_size, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `, {
            replacements: [
                req.file.filename,
                req.file.originalname,
                req.file.path,
                req.file.size
            ],
            type: sequelize.QueryTypes.INSERT
        });

        // 이미지 URL 생성 - 환경변수 우선, 없으면 요청 호스트 정보 사용
        let baseUrl;
        if (process.env.REACT_APP_API_URL) {
            // 프론트엔드와 동일한 환경변수 사용
            baseUrl = process.env.REACT_APP_API_URL;
        } else if (process.env.API_BASE_URL) {
            baseUrl = process.env.API_BASE_URL;
        } else {
            // 환경변수가 없으면 요청 호스트 정보 사용 (프록시 환경 고려)
            const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
            const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:5000';
            baseUrl = `${protocol}://${host}`;
        }
        const imageUrl = `${baseUrl}/api/image/${req.file.filename}`;

        console.log("이미지 업로드 성공:", {
            filename: req.file.filename,
            originalName: req.file.originalname,
            imageUrl: imageUrl,
            filePath: req.file.path
        });

        res.json({
            id: result,
            url: imageUrl,
            filename: req.file.originalname
        });
    } catch (error) {
        console.error("이미지 업로드 오류:", error);
        res.status(500).json({ error: "이미지 업로드에 실패했습니다." });
    }
});

// 이미지 조회
router.get("/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
        // 적절한 Content-Type 헤더 설정
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };

        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1년 캐시

        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: "이미지를 찾을 수 없습니다." });
    }
});

module.exports = router; 