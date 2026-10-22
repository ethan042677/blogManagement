// [联调改造] 数据访问层已从手写 SQL 完整迁移到 Sequelize。
const { Op, fn, col } = require('sequelize');
const {
    sequelize,
    User,
    Category,
    LocalFile,
    Article,
    Praise,
    Comment,
    Label,
    Diary,
    Weather,
    Message,
    Record,
} = require('./sequelize');

const PAGE_DEFAULT = 10;
const PAGE_MAX = 100;

// 统一处理分页参数，避免 nowPage 为 0 或 pageSize 过大
const normalizePage = (pageSize, nowPage) => {
    // 限制分页范围，防止负数页码或超大 pageSize
    const limit = Math.min(Math.max(Number(pageSize) || PAGE_DEFAULT, 1), PAGE_MAX);
    const page = Math.max(Number(nowPage) || 1, 1);
    return { limit, page, offset: (page - 1) * limit };
};

const splitList = (value) => {
    // 数据库中的标签和图片地址使用逗号分隔
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value) return [];
    return String(value).split(',').map((item) => item.trim()).filter(Boolean);
};

const parseCategoryIds = (categoryId) => {
    // 数字表示单分类；逗号字符串表示排除这些分类，即“未分类”
    if (typeof categoryId === 'number' && categoryId >= 0) return categoryId;
    if (typeof categoryId === 'string' && categoryId !== '-1') {
        const ids = categoryId.split(',').map(Number).filter(Number.isInteger);
        if (ids.length === 1) return ids[0];
        if (ids.length > 1) return { [Op.notIn]: ids };
    }
    return undefined;
};

const serializeArticle = (instance) => {
    const item = instance.toJSON ? instance.toJSON() : { ...instance };
    // 标签统一返回数组，便于前端直接遍历
    item.label = splitList(item.label);
    // 图库内容存储为 JSON 字符串，接口层还原成图片数组
    if (item.classify === 1) {
        if (Array.isArray(item.content)) {
            item.content = item.content;
        } else if (item.content) {
            try {
                const parsed = JSON.parse(item.content);
                item.content = Array.isArray(parsed) ? parsed : [item.content];
            } catch {
                item.content = splitList(item.content);
            }
        } else {
            item.content = [];
        }
    }
    return item;
};

const serializeComment = (instance) => {
    const item = instance.toJSON ? instance.toJSON() : { ...instance };
    // 前端评论组件需要嵌套的 user 和 article 结构
    return {
        id: item.id,
        article: item.article ? { id: item.article.id, title: item.article.title } : undefined,
        user: {
            id: item.userId,
            name: item.userName || `访客 ${item.userId}`,
            imgurl: '',
        },
        comment: item.content,
        moment: item.moment,
        complaint: item.complaint,
        isread: item.isread,
    };
};

const serializeMessage = (instance) => {
    const item = instance.toJSON ? instance.toJSON() : { ...instance };
    // 私信复用评论展示组件，因此保持相同的 user/comment 字段
    return {
        id: item.id,
        user: {
            id: item.userId,
            name: item.userName || `访客 ${item.userId}`,
            imgurl: '',
        },
        comment: item.content,
        moment: item.moment,
        isread: item.isread,
    };
};

// 根据文章类型、状态、分类、搜索词和标签生成 Sequelize 查询条件
async function buildArticleWhere(data = {}) {
    // 依次叠加类型、状态、分类、关键词和标签条件
    const where = {};
    if (data.classify === 0 || data.classify === 1) {
        where.classify = data.classify;
    }
    if (data.state === 0 || data.state === 1) {
        where.state = data.state;
    }

    const categoryId = parseCategoryIds(data.categoryId);
    if (categoryId !== undefined) {
        where.categoryId = categoryId;
    }

    const conditions = [];
    if (data.searchTerm) {
        // 标题、简介、正文任一匹配即可
        const keyword = `%${String(data.searchTerm).trim()}%`;
        conditions.push({
            [Op.or]: [
                { title: { [Op.like]: keyword } },
                { introduction: { [Op.like]: keyword } },
                { content: { [Op.like]: keyword } },
            ],
        });
    }

    let labelName = data.labelName;
    if (!labelName && data.labelId && Number(data.labelId) > 0) {
        // 前端传标签 id，数据库存逗号分隔的标签名
        const label = await Label.findByPk(Number(data.labelId));
        labelName = label?.name;
    }
    if (labelName) {
        conditions.push({ label: { [Op.like]: `%${labelName}%` } });
    }
    if (conditions.length) {
        where[Op.and] = conditions;
    }

    return where;
}

/** 管理员基础接口 */
// 验证是否注册：统计 users 表中的管理员数量
exports.isRegister = () => User.count();

// 管理员注册：先检查用户名是否存在，再创建管理员
exports.register = async (value) => {
    const exists = await User.findOne({ where: { name: value.name } });
    if (exists) {
        const error = new Error('用户名已存在');
        error.status = 400;
        throw error;
    }
    return User.create(value);
};

// 管理员登录查询：根据用户名查找管理员
exports.adminSignin = (name) => User.findOne({ where: { name } });

/** 评论接口 */
// 获取评论列表：分页查询评论，并关联所属文章
exports.getCommentPage = async (pageSize, nowPage) => {
    const { limit, offset, page } = normalizePage(pageSize, nowPage);
    const result = await Comment.findAndCountAll({
        // 一次关联文章标题，避免逐条查询
        include: [{ model: Article, as: 'article', attributes: ['id', 'title'], required: false }],
        order: [['id', 'DESC']],
        limit,
        offset,
    });
    return {
        count: result.count,
        page,
        list: result.rows.map(serializeComment),
    };
};

// 获取评论总数：articleId 小于 0 时统计全部评论
exports.getCommentCount = (articleId) => Comment.count({
    where: Number(articleId) >= 0 ? { articleId: Number(articleId) } : undefined,
});

// 获取评论所属文章标题
exports.getArticleTitle = (id) => Article.findByPk(Number(id), { attributes: ['id', 'title'] });

// 把评论标记为已读
exports.updateCommentRead = (id) => Comment.update(
    { isread: 1 },
    { where: { id: Number(id) } },
);

// 删除单条评论
exports.deleteComment = (id) => Comment.destroy({ where: { id: Number(id) } });

/** 私信接口 */
// 获取私信列表：按 id 倒序分页查询
exports.getMessagePage = async (pageSize, nowPage) => {
    const { limit, offset, page } = normalizePage(pageSize, nowPage);
    const result = await Message.findAndCountAll({
        order: [['id', 'DESC']],
        limit,
        offset,
    });
    return {
        count: result.count,
        page,
        list: result.rows.map(serializeMessage),
    };
};

// 获取私信总数
exports.getMessageCount = () => Message.count();

// 把私信标记为已读
exports.updateMessageRead = (id) => Message.update(
    { isread: 1 },
    { where: { id: Number(id) } },
);

// 删除单条私信
exports.deleteMessage = (id) => Message.destroy({ where: { id: Number(id) } });

/** 文章/图库接口 */
// 获取文章或图库列表：分页查询并批量统计点赞数、评论数
exports.getArticlePage = async (data = {}) => {
    const { limit, offset, page } = normalizePage(data.pageSize, data.nowPage);
    const where = await buildArticleWhere(data);
    const result = await Article.findAndCountAll({
        where,
        order: [['moment', 'DESC'], ['id', 'DESC']],
        limit,
        offset,
    });
    const ids = result.rows.map((item) => item.id);
    if (ids.length === 0) {
        return { count: result.count, page, list: [] };
    }

    // [联调修复] 批量统计点赞和评论，原实现既漏 await，也会触发 N+1 查询。
    const [praiseRows, commentRows] = await Promise.all([
        // 两组统计互不依赖，并行查询
        Praise.findAll({
            attributes: ['articleId', [fn('COUNT', col('id')), 'count']],
            where: { articleId: { [Op.in]: ids } },
            group: ['articleId'],
            raw: true,
        }),
        Comment.findAll({
            attributes: ['articleId', [fn('COUNT', col('id')), 'count']],
            where: { articleId: { [Op.in]: ids } },
            group: ['articleId'],
            raw: true,
        }),
    ]);
    const praiseMap = new Map(praiseRows.map((item) => [Number(item.articleId), Number(item.count)]));
    const commentMap = new Map(commentRows.map((item) => [Number(item.articleId), Number(item.count)]));

    return {
        count: result.count,
        page,
        list: result.rows.map((instance) => ({
            ...serializeArticle(instance),
            praise: praiseMap.get(instance.id) || 0,
            comment: commentMap.get(instance.id) || 0,
        })),
    };
};

// 获取文章或图库总数：支持与列表相同的筛选条件
exports.getArticleCount = async (data = {}) => {
    const where = await buildArticleWhere(data);
    return Article.count({ where });
};

// 获取文章状态统计：分别统计未发布和已发布文章数量
exports.getArticleStateCounts = async () => {
    const rows = await Article.findAll({
        attributes: ['state', [fn('COUNT', col('id')), 'value']],
        where: { classify: 0 },
        group: ['state'],
        raw: true,
    });
    const map = new Map(rows.map((item) => [Number(item.state), Number(item.value)]));
    return [
        { id: 0, name: '未发布', value: map.get(0) || 0 },
        { id: 1, name: '已发布', value: map.get(1) || 0 },
    ];
};

// 发布或撤回文章：state 只允许 0 或 1
exports.changeArticleState = (id, state) => {
    if (![0, 1].includes(Number(state))) {
        const error = new Error('文章状态只能是 0 或 1');
        error.status = 400;
        throw error;
    }
    return Article.update({ state: Number(state) }, { where: { id: Number(id) } });
};

// 删除文章/图库：使用事务同时删除关联评论和点赞
exports.deleteArticle = (id) => sequelize.transaction(async (transaction) => {
    // 同一事务中清理点赞和评论，避免残留孤立互动数据
    const articleId = Number(id);
    await Comment.destroy({ where: { articleId }, transaction });
    await Praise.destroy({ where: { articleId }, transaction });
    return Article.destroy({ where: { id: articleId }, transaction });
});

// 新建文章/图库：统一处理图库图片数组和标签字段
exports.createArticle = (value) => {
    // 统一字段名并补默认值，兼容旧接口的 category_id
    const data = {
        ...value,
        classify: Number(value.classify ?? 0),
        categoryId: value.categoryId ?? value.category_id ?? null,
        label: splitList(value.label).join(','),
        state: Number(value.state ?? 0),
        views: Number(value.views ?? 0),
        moment: value.moment || new Date().toISOString(),
    };
    if (data.classify === 1 && Array.isArray(value.content)) {
        // 图库图片数组落库前转成 JSON 字符串
        data.content = JSON.stringify(value.content);
    }
    return Article.create(data);
};

// 获取文章/图库详情：用于打开编辑页
exports.gainArticle = async (id) => {
    const article = await Article.findByPk(Number(id));
    return article ? serializeArticle(article) : null;
};

// 修改文章/图库：处理前端字段与数据库字段之间的转换
exports.updateArticle = async (id, value) => {
    const data = { ...value };
    // 兼容旧字段后移除未知字段，避免误更新主键
    if (data.category_id !== undefined) data.categoryId = data.category_id;
    if (data.weather_id !== undefined) data.weatherId = data.weather_id;
    delete data.category_id;
    delete data.weather_id;
    if (data.label !== undefined) data.label = splitList(data.label).join(',');
    if (Array.isArray(data.content)) data.content = JSON.stringify(data.content);
    delete data.id;
    const [affected] = await Article.update(data, { where: { id: Number(id) } });
    return affected;
};

/** 分类接口 */
// 获取分类统计：返回每类内容数量及该类型内容总数
exports.getCategoryStats = async (classify) => {
    const type = Number(classify);
    const countModel = type === 2 ? LocalFile : Article;
    const countWhere = type === 2 ? {} : { classify: type };
    const count = await countModel.count({ where: countWhere });
    const categories = await Category.findAll({
        where: { classify: type },
        order: [['id', 'ASC']],
    });
    const grouped = await countModel.findAll({
        // 按分类聚合内容数量，减少逐个分类查询
        attributes: ['categoryId', [fn('COUNT', col('id')), 'value']],
        where: { ...countWhere, categoryId: { [Op.ne]: null } },
        group: ['categoryId'],
        raw: true,
    });
    const groupedMap = new Map(grouped.map((item) => [Number(item.categoryId), Number(item.value)]));
    return {
        count,
        list: categories.map((item) => ({
            id: item.id,
            name: item.name,
            value: groupedMap.get(item.id) || 0,
            moment: item.moment,
        })),
    };
};

// 获取分类列表：根据 classify 查询文章、图库或资源分类
exports.getCategory = (classify) => Category.findAll({
    where: { classify: Number(classify) },
    order: [['id', 'ASC']],
});

// 新建分类
exports.addCategory = (value) => Category.create({
    name: value.name ?? value.category_name,
    classify: Number(value.classify),
    moment: value.moment || new Date().toISOString(),
});

// 修改分类名称
exports.updateCategoryName = (id, name) => Category.update(
    { name },
    { where: { id: Number(id) } },
);

// 删除分类：事务内先把关联文章和文件改为未分类
exports.deleteCategory = (id) => sequelize.transaction(async (transaction) => {
    // 删除分类前先把关联内容置空，形成“未分类”
    const categoryId = Number(id);
    await Article.update({ categoryId: null }, { where: { categoryId }, transaction });
    await LocalFile.update({ categoryId: null }, { where: { categoryId }, transaction });
    return Category.destroy({ where: { id: categoryId }, transaction });
});

/** 标签接口 */
// 获取全部标签
exports.getLabel = () => Label.findAll({
    order: [['id', 'ASC']],
});

// 新建标签
exports.addLabel = (value) => Label.create({
    name: value.name ?? value.label_name,
    moment: value.moment || new Date().toISOString(),
});

// 删除标签
exports.deleteLabel = (id) => Label.destroy({ where: { id: Number(id) } });

/** 本地文件接口 */
// 获取文件列表：分页查询并支持分类筛选
exports.getFilePage = async (data = {}) => {
    const { limit, offset, page } = normalizePage(data.pageSize, data.nowPage);
    const categoryId = parseCategoryIds(data.categoryId);
    const where = categoryId === undefined ? {} : { categoryId };
    const result = await LocalFile.findAndCountAll({
        where,
        order: [['id', 'DESC']],
        limit,
        offset,
    });
    return {
        count: result.count,
        page,
        list: result.rows.map((item) => item.toJSON()),
    };
};

// 获取文件总数：支持全部、指定分类和未分类
exports.getFileCount = (categoryId) => {
    const parsed = parseCategoryIds(categoryId);
    return LocalFile.count({ where: parsed === undefined ? {} : { categoryId: parsed } });
};

// 批量保存上传文件的信息
exports.uploadFiles = (values) => LocalFile.bulkCreate(values, { returning: true });

// 移动文件：支持单文件和批量移动
exports.moveFile = async (fileId, categoryId) => {
    // 单个 id 和批量 id 数组统一成数组处理
    const ids = Array.isArray(fileId) ? fileId.map(Number) : [Number(fileId)];
    return LocalFile.update(
        { categoryId: categoryId === -1 ? null : Number(categoryId) },
        { where: { id: { [Op.in]: ids } } },
    );
};

// 删除文件记录：支持单文件和批量删除
exports.deleteFile = async (fileId) => {
    // 支持单 id、id 数组和逗号分隔字符串
    const ids = Array.isArray(fileId) ? fileId.map(Number) : String(fileId).split(',').map(Number);
    return LocalFile.destroy({ where: { id: { [Op.in]: ids.filter(Number.isInteger) } } });
};

/** 日记接口 */
// 新建日记：图片数组会转换为逗号分隔的字符串
exports.createDiary = (value) => Diary.create({
    title: value.title,
    content: value.content,
    picture: Array.isArray(value.picture) ? value.picture.join(',') : value.picture,
    weatherId: Number(value.weatherId ?? value.weather_id ?? 0),
    mood: Number(value.mood ?? 0),
    moment: value.moment || new Date().toISOString(),
});

// 获取日记列表：支持分页和标题/正文搜索
exports.getDiaryPage = async (data = {}) => {
    const { limit, offset, page } = normalizePage(data.pageSize, data.nowPage);
    const where = data.searchTerm ? {
        [Op.or]: [
            { title: { [Op.like]: `%${data.searchTerm}%` } },
            { content: { [Op.like]: `%${data.searchTerm}%` } },
        ],
    } : {};
    const result = await Diary.findAndCountAll({
        // 按发布时间和 id 倒序，保证同时间数据顺序稳定
        where,
        order: [['moment', 'DESC'], ['id', 'DESC']],
        limit,
        offset,
    });
    return {
        count: result.count,
        page,
        list: result.rows.map((item) => {
            const value = item.toJSON();
            value.picture = splitList(value.picture);
            return value;
        }),
    };
};

// 获取日记总数：支持关键词搜索
exports.getDiaryCount = (searchTerm) => Diary.count({
    where: searchTerm ? {
        [Op.or]: [
            { title: { [Op.like]: `%${searchTerm}%` } },
            { content: { [Op.like]: `%${searchTerm}%` } },
        ],
    } : {},
});

// 删除日记
exports.deleteDiary = (id) => Diary.destroy({ where: { id: Number(id) } });

/** 天气接口 */
// 获取天气列表
exports.getWeather = () => Weather.findAll({ order: [['id', 'ASC']] });

/** 总览与统计接口 */
// 获取总览内容数量：文章、图库、日记
exports.getOverviewCounts = async () => {
    const [article, gallery, diary] = await Promise.all([
        Article.count({ where: { classify: 0 } }),
        Article.count({ where: { classify: 1 } }),
        Diary.count(),
    ]);
    return { article, gallery, diary };
};

// 生成距离今天指定天数的日期
function daysAgoDate(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(0, 0, 0, 0);
    return date;
}

// 获取访问量：按天统计最近 1 至 30 天的访问记录
exports.getVisits = async (length = 30) => {
    const days = Math.min(Math.max(Number(length) || 7, 1), 30);
    const start = daysAgoDate(days - 1);
    const records = await Record.findAll({
        attributes: ['moment'],
        where: { moment: { [Op.gte]: start.toISOString() } },
        raw: true,
    });
    const counts = new Map();
    // 先按日期累计记录数，再补齐没有访问的日期
    for (const record of records) {
        const key = String(record.moment).slice(0, 10);
        counts.set(key, (counts.get(key) || 0) + 1);
    }
    const result = [];
    for (let offset = days - 1; offset >= 0; offset -= 1) {
        const date = daysAgoDate(offset);
        const key = date.toISOString().slice(0, 10);
        result.push({ date: key, count: counts.get(key) || 0 });
    }
    return result;
};

// 获取数据监测：统计设备分布和网站内容分布
exports.getSurvey = async (length = 7) => {
    const days = Math.min(Math.max(Number(length) || 7, 1), 30);
    const where = { moment: { [Op.gte]: daysAgoDate(days - 1).toISOString() } };
    const [deviceRows, overview, fileCount] = await Promise.all([
        // 设备分布、内容统计和文件数可并行获取
        Record.findAll({
            attributes: ['device', [fn('COUNT', col('id')), 'value']],
            where,
            group: ['device'],
            raw: true,
        }),
        exports.getOverviewCounts(),
        LocalFile.count(),
    ]);
    const deviceMap = new Map(deviceRows.map((item) => [Number(item.device), Number(item.value)]));
    return {
        device: [
            { key: 'mobile', name: '移动端', value: deviceMap.get(0) || 0 },
            { key: 'pc', name: 'PC端', value: deviceMap.get(1) || 0 },
        ],
        website: [
            { key: 'file', name: '本地文件', value: fileCount },
            { key: 'blog', name: '博客文章', value: overview.article },
            { key: 'gallery', name: '摄影图库', value: overview.gallery },
            { key: 'diary', name: '随笔随记', value: overview.diary },
        ],
    };
};

exports.models = {
    User,
    Category,
    LocalFile,
    Article,
    Praise,
    Comment,
    Label,
    Diary,
    Weather,
    Message,
    Record,
};
