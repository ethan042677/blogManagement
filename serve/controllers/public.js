const publicModel = require('../models/public_model');

// 公开接口与后台接口保持相同响应外壳，前端可以复用统一解包逻辑。
const success = (res, data, msg = '操作成功') => res.send({ code: 200, msg, data });

// 生成带 HTTP 状态码的业务异常，交由 app.js 统一错误中间件处理。
const badRequest = (message) => {
    const error = new Error(message);
    error.status = 400;
    throw error;
};

// 所有带 :id 的公开接口先校验正整数，避免 NaN 或异常 SQL 条件。
const articleId = (req) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) badRequest('文章编号不正确');
    return id;
};

// 评论采用纯文本保存，移除标签和控制字符，并限制名称与正文长度。
const plainText = (value, max) => String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\u0000/g, '')
    .trim()
    .slice(0, max);

// 首页公开统计：文章、摄影和日记数量。
exports.site = async (req, res) => {
    success(res, await publicModel.getSiteSummary());
};

// 文章列表只转发白名单查询参数，发布状态由数据层强制指定。
exports.articles = async (req, res) => {
    success(res, await publicModel.getPublishedArticles({
        page: req.query.page,
        pageSize: req.query.pageSize,
        categoryId: req.query.categoryId,
        search: req.query.search,
    }));
};

// 公开详情只返回已发布文章；不存在时统一返回 404。
exports.article = async (req, res) => {
    const data = await publicModel.getPublishedArticle(articleId(req));
    if (!data) {
        const error = new Error('文章不存在或尚未发布');
        error.status = 404;
        throw error;
    }
    success(res, data);
};

// 匿名点赞返回最新总数，不接收用户 ID 或其他身份参数。
exports.like = async (req, res) => {
    const data = await publicModel.likeArticle(articleId(req));
    if (!data) {
        const error = new Error('文章不存在或尚未发布');
        error.status = 404;
        throw error;
    }
    success(res, data, '点赞成功');
};

// classify 只允许 0 或 1，数据层会把其他值归一为文章分类。
exports.categories = async (req, res) => {
    success(res, await publicModel.getCategories(req.query.classify));
};

// 摄影列表使用独立控制器，避免与文章接口共享可变筛选逻辑。
exports.photos = async (req, res) => {
    success(res, await publicModel.getPublishedPhotos({
        page: req.query.page,
        pageSize: req.query.pageSize,
        categoryId: req.query.categoryId,
    }));
};

// 摄影详情以系列为单位返回完整图片数组。
exports.photo = async (req, res) => {
    const data = await publicModel.getPublishedPhoto(articleId(req));
    if (!data) {
        const error = new Error('摄影系列不存在或尚未发布');
        error.status = 404;
        throw error;
    }
    success(res, data);
};

// 日记列表只提供公开时间轴数据。
exports.diaries = async (req, res) => {
    success(res, await publicModel.getDiaries({
        page: req.query.page,
        pageSize: req.query.pageSize,
    }));
};

// 评论读取前确认目标文章仍处于发布状态。
exports.comments = async (req, res) => {
    const data = await publicModel.getComments(articleId(req));
    if (!data) {
        const error = new Error('文章不存在或尚未发布');
        error.status = 404;
        throw error;
    }
    success(res, data);
};

// 评论创建返回新评论和本小时剩余次数，前端据此同步提示。
exports.createComment = async (req, res) => {
    const name = plainText(req.body?.name, 20);
    const content = plainText(req.body?.content, 500);
    if (!name) badRequest('请填写名称');
    if (!content) badRequest('请填写评论内容');
    const comment = await publicModel.createComment(articleId(req), { name, content });
    if (!comment) {
        const error = new Error('文章不存在或尚未发布');
        error.status = 404;
        throw error;
    }
    success(res, {
        comment,
        remaining: res.locals.rateLimitRemaining ?? null,
    }, '评论发布成功');
};

// 访问上报失败由全局错误处理返回，不影响前台页面继续浏览。
exports.trackVisit = async (req, res) => {
    await publicModel.trackVisit({
        path: req.body?.path,
        device: req.body?.device,
    });
    success(res, null, '访问已记录');
};
