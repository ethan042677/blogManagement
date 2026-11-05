const { Op, fn, col } = require('sequelize');
const {
    Article,
    Category,
    Comment,
    Diary,
    Weather,
    Record,
} = require('./sequelize');

const PAGE_DEFAULT = 8;
const PAGE_MAX = 30;

// 公开分页统一设置上限，避免前台传入超大 pageSize 拖慢数据库。
const normalizePage = (pageSize, page) => {
    const limit = Math.min(Math.max(Number(pageSize) || PAGE_DEFAULT, 1), PAGE_MAX);
    const current = Math.max(Number(page) || 1, 1);
    return { limit, page: current, offset: (current - 1) * limit };
};

// 数据库中的标签和日记图片使用逗号分隔，也兼容已经解析好的数组。
const splitList = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value) return [];
    return String(value).split(',').map((item) => item.trim()).filter(Boolean);
};

// 阅读时间只按纯文本长度估算，移除富文本标签后再计算。
const stripHtml = (value) => String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// 按每分钟约 500 字估算，最少显示 1 分钟。
const readMinutes = (content) => {
    const length = stripHtml(content).length;
    return Math.max(1, Math.ceil(length / 500));
};

// 摄影 content 可能是 JSON 数组、逗号字符串或普通数组，这里统一还原。
const parsePictures = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : splitList(value);
    } catch {
        return splitList(value);
    }
};

// 批量读取分类名称，避免文章列表逐条查询造成 N+1。
async function categoryMap(categoryIds) {
    const ids = [...new Set(categoryIds.filter(Number.isInteger))];
    if (!ids.length) return new Map();
    const rows = await Category.findAll({
        attributes: ['id', 'name'],
        where: { id: { [Op.in]: ids } },
        raw: true,
    });
    return new Map(rows.map((item) => [Number(item.id), item.name]));
}

// 批量统计评论数量，文章列表只需要总数而不暴露评论者数据。
async function commentCounts(articleIds) {
    if (!articleIds.length) return new Map();
    const rows = await Comment.findAll({
        attributes: ['articleId', [fn('COUNT', col('id')), 'count']],
        where: { articleId: { [Op.in]: articleIds } },
        group: ['articleId'],
        raw: true,
    });
    return new Map(rows.map((item) => [Number(item.articleId), Number(item.count)]));
}

// 将数据库文章转换为前台 DTO，只返回页面确实需要的公开字段。
async function toArticleDto(instance, categories = null, comments = null) {
    const item = instance.toJSON ? instance.toJSON() : { ...instance };
    const map = categories || await categoryMap([Number(item.categoryId)]);
    const commentTotal = comments?.get(Number(item.id)) ?? await Comment.count({ where: { articleId: item.id } });
    return {
        id: item.id,
        title: item.title || '未命名文章',
        introduction: item.introduction || '',
        cover: item.cover || '',
        categoryId: item.categoryId ?? null,
        categoryName: map.get(Number(item.categoryId)) || '未分类',
        labels: splitList(item.label),
        moment: item.moment,
        views: Number(item.views) || 0,
        likes: Number(item.likes) || 0,
        comments: commentTotal,
        readMinutes: readMinutes(item.content),
    };
}

// 前台文章查询强制限定已发布文章，不接受客户端传入发布状态。
async function buildPublishedArticleWhere(data = {}) {
    const where = {
        classify: 0,
        state: 1,
    };
    if (Number.isInteger(Number(data.categoryId)) && Number(data.categoryId) > 0) {
        where.categoryId = Number(data.categoryId);
    }
    if (data.search) {
        const keyword = `%${String(data.search).trim().slice(0, 80)}%`;
        where[Op.or] = [
            { title: { [Op.like]: keyword } },
            { introduction: { [Op.like]: keyword } },
            { content: { [Op.like]: keyword } },
        ];
    }
    return where;
}

// 首页统计只计算已经公开的文章、摄影和已有日记。
exports.getSiteSummary = async () => {
    const [articles, photos, diaries] = await Promise.all([
        Article.count({ where: { classify: 0, state: 1 } }),
        Article.count({ where: { classify: 1, state: 1 } }),
        Diary.count(),
    ]);
    return { articles, photos, diaries };
};

// 已发布文章列表支持分类、搜索和分页；所有结果移除后台管理字段。
exports.getPublishedArticles = async (data = {}) => {
    const { limit, page, offset } = normalizePage(data.pageSize, data.page);
    const where = await buildPublishedArticleWhere(data);
    const result = await Article.findAndCountAll({
        where,
        order: [['moment', 'DESC'], ['id', 'DESC']],
        limit,
        offset,
    });
    const ids = result.rows.map((row) => Number(row.id));
    const [categories, comments] = await Promise.all([
        categoryMap(result.rows.map((row) => Number(row.categoryId))),
        commentCounts(ids),
    ]);
    return {
        count: result.count,
        page,
        pageSize: limit,
        list: await Promise.all(result.rows.map((row) => toArticleDto(row, categories, comments))),
    };
};

// 读取公开文章详情，并在成功访问时原子增加阅读量。
exports.getPublishedArticle = async (id) => {
    const article = await Article.findOne({
        where: { id: Number(id), classify: 0, state: 1 },
    });
    if (!article) return null;
    await article.increment('views', { by: 1 });
    const refreshed = await Article.findByPk(article.id);
    const dto = await toArticleDto(refreshed);
    return {
        ...dto,
        content: article.content || '',
        updatedAt: article.moment,
    };
};

// 点赞只更新文章聚合字段，不记录点赞人，也不写入用户关联表。
exports.likeArticle = async (id) => {
    const article = await Article.findOne({
        attributes: ['id', 'likes'],
        where: { id: Number(id), classify: 0, state: 1 },
    });
    if (!article) return null;
    await article.increment('likes', { by: 1 });
    const refreshed = await Article.findByPk(article.id, { attributes: ['likes'] });
    return { likes: Number(refreshed.likes) || 0 };
};

// 分类数量只统计已发布内容，未发布草稿不会泄露到前台。
exports.getCategories = async (classify) => {
    const type = Number(classify) === 1 ? 1 : 0;
    const categories = await Category.findAll({
        attributes: ['id', 'name'],
        where: { classify: type },
        order: [['id', 'ASC']],
        raw: true,
    });
    const counts = await Article.findAll({
        attributes: ['categoryId', [fn('COUNT', col('id')), 'count']],
        where: { classify: type, state: 1, categoryId: { [Op.ne]: null } },
        group: ['categoryId'],
        raw: true,
    });
    const map = new Map(counts.map((item) => [Number(item.categoryId), Number(item.count)]));
    return categories.map((item) => ({
        id: Number(item.id),
        name: item.name,
        count: map.get(Number(item.id)) || 0,
    }));
};

// 摄影列表复用文章表，通过 classify=1 取出已发布图集。
exports.getPublishedPhotos = async (data = {}) => {
    const { limit, page, offset } = normalizePage(data.pageSize, data.page);
    const where = { classify: 1, state: 1 };
    if (Number.isInteger(Number(data.categoryId)) && Number(data.categoryId) > 0) {
        where.categoryId = Number(data.categoryId);
    }
    const result = await Article.findAndCountAll({
        where,
        order: [['moment', 'DESC'], ['id', 'DESC']],
        limit,
        offset,
    });
    const categories = await categoryMap(result.rows.map((row) => Number(row.categoryId)));
    const comments = await commentCounts(result.rows.map((row) => Number(row.id)));
    return {
        count: result.count,
        page,
        pageSize: limit,
        list: await Promise.all(result.rows.map(async (row) => ({
            ...(await toArticleDto(row, categories, comments)),
            pictures: parsePictures(row.content),
        }))),
    };
};

// 摄影详情同样只允许读取已发布系列，并累计阅读量。
exports.getPublishedPhoto = async (id) => {
    const article = await Article.findOne({
        where: { id: Number(id), classify: 1, state: 1 },
    });
    if (!article) return null;
    await article.increment('views', { by: 1 });
    const refreshed = await Article.findByPk(article.id);
    return {
        ...(await toArticleDto(refreshed)),
        pictures: parsePictures(refreshed.content),
    };
};

// 日记按时间倒序分页，并补充天气名称与图标。
exports.getDiaries = async (data = {}) => {
    const { limit, page, offset } = normalizePage(data.pageSize, data.page);
    const result = await Diary.findAndCountAll({
        order: [['moment', 'DESC'], ['id', 'DESC']],
        limit,
        offset,
    });
    const weatherRows = await Weather.findAll({ raw: true });
    const weatherMap = new Map(weatherRows.map((item) => [Number(item.id), item]));
    return {
        count: result.count,
        page,
        pageSize: limit,
        list: result.rows.map((row) => {
            const item = row.toJSON();
            const weather = weatherMap.get(Number(item.weatherId));
            return {
                id: item.id,
                title: item.title,
                content: item.content || '',
                moment: item.moment,
                pictures: splitList(item.picture),
                weatherId: Number(item.weatherId) || 0,
                weatherName: weather?.name || '',
                weatherIcon: weather?.icon || '',
                mood: Number(item.mood) || 0,
            };
        }),
    };
};

// 评论列表只返回昵称、正文和时间，不输出历史用户字段。
exports.getComments = async (articleId) => {
    const article = await Article.findOne({
        attributes: ['id'],
        where: { id: Number(articleId), classify: 0, state: 1 },
    });
    if (!article) return null;
    const [count, rows] = await Promise.all([
        Comment.count({ where: { articleId: article.id } }),
        Comment.findAll({
            attributes: ['id', 'userName', 'content', 'moment'],
            where: { articleId: article.id },
            order: [['id', 'DESC']],
            limit: 50,
            raw: true,
        }),
    ]);
    return {
        count,
        list: rows.map((item) => ({
            id: Number(item.id),
            name: item.userName || '匿名读者',
            content: item.content || '',
            moment: item.moment,
        })),
    };
};

// 创建匿名评论前再次确认文章已发布，并写入访客占位值。
exports.createComment = async (articleId, value) => {
    const article = await Article.findOne({
        attributes: ['id'],
        where: { id: Number(articleId), classify: 0, state: 1 },
    });
    if (!article) return null;
    const comment = await Comment.create({
        // 前台没有账号体系；这里只保存访客占位值，不关联任何真实用户。
        userId: 'guest',
        userCategory: 1,
        userName: value.name,
        articleId: article.id,
        content: value.content,
        complaint: 0,
        isread: 0,
        moment: new Date().toISOString(),
    });
    return {
        id: Number(comment.id),
        name: comment.userName,
        content: comment.content,
        moment: comment.moment,
    };
};

// 访问记录不关联真实用户，仅用于后台聚合页面和设备分布。
exports.trackVisit = (value) => Record.create({
    // 访问统计只保留页面、设备与时间，不保存访问者身份。
    userId: 'guest',
    userCategory: 1,
    position: String(value.path || '/').slice(0, 100),
    device: Number(value.device) === 0 ? 0 : 1,
    moment: new Date().toISOString(),
});
