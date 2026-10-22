// [联调改造] 上传接口改为 /uploadFile，文件名使用随机值并保留安全后缀。
const crypto = require('crypto');
const path = require('path');
const express = require('express');
const multer = require('multer');
const serve = require('../controllers/serve');
const { authenticate } = require('../utils/auth');

const storage = multer.diskStorage({
    // 文件统一保存到本地 public/files
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/files'));
    },
    // 随机文件名避免同名覆盖，同时保留安全后缀
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase().slice(0, 12);
        cb(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
    },
});

const upload = multer({
    storage,
    // 限制单文件 20MB、单次最多 20 个文件
    limits: {
        fileSize: 20 * 1024 * 1024,
        files: 20,
    },
});

const router = express.Router();
const asyncHandler = (handler) => (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
};

// 文件上传接口：接收一个或多个本地文件并保存文件信息
router.post(
    '/uploadFile',
    authenticate,
    upload.array('files', 20),
    asyncHandler(serve.uploadFile),
);

// 头像/图片上传兼容接口：保留旧地址，实际仍保存到本地文件目录
// [联调兼容] 修正旧实现读取未定义 file 变量的问题
router.post(
    '/profile',
    authenticate,
    upload.array('files', 20),
    asyncHandler(serve.uploadFile),
);

module.exports = router;
