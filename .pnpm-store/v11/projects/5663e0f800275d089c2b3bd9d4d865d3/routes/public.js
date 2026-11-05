const express = require('express');
const controller = require('../controllers/public');
const { createRateLimiter } = require('../middleware/publicRateLimit');

const router = express.Router();
// 公开路由统一捕获异步异常，防止未处理的 Promise 影响 Express 服务。
const asyncHandler = (handler) => (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
};

// 匿名评论限制：同一临时 IP 每小时最多 10 条，计数不会持久化身份。
const commentLimiter = createRateLimiter({
    name: 'public-comments',
    windowMs: 60 * 60 * 1000,
    max: 10,
});

// 内容读取接口全部无需 token；后台内容管理仍使用原路由和 JWT。
router.get('/site', asyncHandler(controller.site));
router.get('/articles', asyncHandler(controller.articles));
router.get('/articles/:id', asyncHandler(controller.article));
router.post('/articles/:id/like', asyncHandler(controller.like));
router.get('/articles/:id/comments', asyncHandler(controller.comments));
router.post('/articles/:id/comments', commentLimiter, asyncHandler(controller.createComment));
router.get('/categories', asyncHandler(controller.categories));
router.get('/photos', asyncHandler(controller.photos));
router.get('/photos/:id', asyncHandler(controller.photo));
router.get('/diaries', asyncHandler(controller.diaries));
router.post('/visits', asyncHandler(controller.trackVisit));

module.exports = router;
