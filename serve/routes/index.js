// [联调改造] 路由改为标准 Express Router，并为业务接口统一挂载认证中间件。
const express = require('express');
const serve = require('../controllers/serve');
const { authenticate } = require('../utils/auth');

const router = express.Router();
// 统一捕获 async 控制器异常，交给 app.js 的错误中间件处理
const asyncHandler = (handler) => (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
};
// 受保护接口统一套用登录鉴权和异常捕获
const post = (path, handler) => router.post(path, authenticate, asyncHandler(handler));

// 健康检查接口：确认服务是否已经正常启动
router.get('/health', (req, res) => {
    res.send({ code: 200, msg: '服务正常' });
});

// 验证是否注册接口：查询管理员账号是否已经创建
router.post('/isRegister', asyncHandler(serve.isRegister));
// 管理员注册接口：创建新的后台管理员
router.post('/register', asyncHandler(serve.register));
// 管理员登录接口：校验账号密码并返回 token
router.post('/signin', asyncHandler(serve.adminSignin));

// 总览数据接口：获取文章、图库、日记数量和本地文件大小
post('/overview', serve.getOverview);
// 访问量接口：按最近一周或一个月返回每日访问量
post('/visits', serve.getVisits);
// 数据监测接口：返回设备分布和网站内容分布
post('/survey', serve.getSurvey);

// 获取评论接口：分页查询文章评论
post('/comment', serve.getComment);
// 删除评论接口：根据评论 id 删除一条评论
post('/deleteComment', serve.deleteComment);
// 获取私信接口：分页查询私信并更新已读状态
post('/message', serve.getMessage);
// 删除私信接口：根据私信 id 删除一条私信
post('/deleteMessage', serve.deleteMessage);

// 获取文章接口：支持文章/图库、分页、分类、状态、标签和关键词筛选
post('/article', serve.getArticle);
// 修改文章状态接口：发布或撤回文章
post('/changeArticleState', serve.changeArticleState);
// 删除文章接口：删除文章及其关联的点赞和评论
post('/deleteArticle', serve.deleteArticle);
// 文章状态统计接口：查询已发布和未发布文章数量
post('/articleState', serve.getArticleStateCount);

// 获取分类接口：按文章、图库或资源类型返回分类及数量
post('/category', serve.getCategory);
// 新建分类接口：新增一个文章、图库或资源分类
post('/addCategory', serve.addCategory);
// 修改分类名称接口：根据分类 id 修改名称
post('/updateCategoryName', serve.updateCategoryName);
// 删除分类接口：删除分类并将关联内容改为未分类
post('/deleteCategory', serve.deleteCategory);

// 获取标签接口：查询全部文章标签
post('/label', serve.getLabel);
// 新建标签接口：新增一个文章标签
post('/addLabel', serve.addLabel);
// 删除标签接口：根据标签 id 删除标签
post('/deleteLabel', serve.deleteLabel);

// 获取文件接口：分页查询本地文件并支持分类筛选
post('/file', serve.getFilePage);
// 删除文件接口：删除文件记录并删除本地文件
post('/deleteFile', serve.deleteFile);
// 移动文件接口：将单个或多个文件移动到指定分类
post('/moveFile', serve.moveFile);

// 获取日记接口：分页查询日记并支持关键词搜索
post('/diary', serve.getDiaryPage);
// 删除日记接口：根据日记 id 删除日记
post('/deleteDiary', serve.deleteDiary);
// 新建日记接口：保存标题、正文、天气和本地图片
post('/createDiary', serve.createDiary);
// 新建文章/图库接口：保存文章或摄影图库
post('/createArticle', serve.createArticle);
// 获取文章/图库详情接口：用于查看或编辑单条内容
post('/gainArticle', serve.gainArticle);
// 修改文章/图库接口：更新单条文章或图库内容
post('/updateArticle', serve.updateArticle);
// 获取天气接口：返回日记页面可选的天气列表
post('/weather', serve.getWeather);

module.exports = router;
