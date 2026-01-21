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
        fileSize: 200 * 1024 * 1024 // 200MB 제한
    },
    fileFilter: function (req, file, cb) {
        // 동영상 파일만 허용
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('동영상 파일만 업로드 가능합니다.'), false);
        }
    }
});

// 동영상 업로드
router.post("/", upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "동영상 파일이 없습니다." });
        }

        // 데이터베이스에 동영상 정보 저장 (post_video 테이블 사용, 없으면 post_image 테이블 사용)
        let result;
        try {
            // 먼저 post_video 테이블이 있는지 확인
            const [tableCheck] = await sequelize.query(`
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE() 
                AND table_name = 'post_video'
            `, { type: sequelize.QueryTypes.SELECT });

            if (tableCheck && tableCheck.count > 0) {
                // post_video 테이블이 있으면 사용
                [result] = await sequelize.query(`
                    INSERT INTO post_video (filename, original_name, file_path, file_size, created_at)
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
            } else {
                // post_video 테이블이 없으면 post_image 테이블 사용 (임시)
                [result] = await sequelize.query(`
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
            }
        } catch (dbError) {
            console.error("데이터베이스 저장 오류:", dbError);
            // 데이터베이스 저장 실패해도 파일은 업로드되었으므로 계속 진행
            result = { insertId: null };
        }

        // 동영상 URL 생성 - 환경변수 우선, 없으면 요청 호스트 정보 사용
        let baseUrl;
        if (process.env.REACT_APP_API_URL) {
            baseUrl = process.env.REACT_APP_API_URL;
        } else if (process.env.API_BASE_URL) {
            baseUrl = process.env.API_BASE_URL;
        } else {
            const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
            const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:5000';
            baseUrl = `${protocol}://${host}`;
        }
        const videoUrl = `${baseUrl}/api/video/${req.file.filename}`;

        console.log("동영상 업로드 성공:", {
            filename: req.file.filename,
            originalName: req.file.originalname,
            videoUrl: videoUrl,
            filePath: req.file.path
        });

        res.json({
            id: result.insertId || result,
            url: videoUrl,
            filename: req.file.originalname
        });
    } catch (error) {
        console.error("동영상 업로드 오류:", error);
        res.status(500).json({ error: "동영상 업로드에 실패했습니다." });
    }
});

// 동영상 조회
router.get("/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
        // 적절한 Content-Type 헤더 설정
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.ogg': 'video/ogg',
            '.mov': 'video/quicktime',
            '.avi': 'video/x-msvideo',
            '.wmv': 'video/x-ms-wmv',
            '.flv': 'video/x-flv',
            '.mkv': 'video/x-matroska'
        };

        const contentType = mimeTypes[ext] || 'video/mp4';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1년 캐시
        res.setHeader('Accept-Ranges', 'bytes'); // 스트리밍 지원

        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: "동영상을 찾을 수 없습니다." });
    }
});

module.exports = router;

