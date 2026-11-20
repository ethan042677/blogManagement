// [联调改造] 控制器只负责参数整理和响应，数据库操作全部交给 Sequelize 数据层。
const path = require('path');
const dbModel = require('../models/db_model');
const jwt = require('../utils/jsonwebtoken');
const handleFile = require('../utils/handleFile');
const Argon2 = require('../utils/argon2')
const media = require('../utils/mediaService')
const articleContent = require('../utils/articleContent')

// 统一成功响应格式，保证每个接口都返回 code、msg 和 data
const success = (res, data, msg = '操作成功') => res.send({ code: 200, msg, data });

// 校验必填参数，缺少时返回 400，而不是继续访问数据库
const requireValue = (value, message) => {
    if (value === undefined || value === null || value === '') {
        const error = new Error(message);
        error.status = 400;
        throw error;
    }
    return value;
};

// 文章正文只通过 RustFS 传递。markdown 属于接口字段而不是 article 表字段，
// 写库前必须移除，避免 Sequelize 把它当成未知列。
const hasMarkdown = (value) => typeof value.markdown === 'string'

const articleMetadata = (value, withMarkdown) => {
    const data = { ...value }
    delete data.markdown
    delete data.contentMarkdown
    // 新文章不再把正文写进 article.content；旧接口未传 markdown 时保持原行为。
    if (withMarkdown && Number(data.classify ?? 0) === 0) delete data.content
    return data
}

// 验证是否注册接口：判断 users 表中是否已有管理员
exports.isRegister = async (req, res) => {
    const count = await dbModel.isRegister();
    success(res, { isRegistered: count > 0 }, count > 0 ? '已注册' : '未注册');
};

// 管理员注册接口：校验账号密码后创建管理员
exports.register = async (req, res) => {
    const name = requireValue(req.body.name, '账号不能为空');
    const password = requireValue(req.body.password || req.body.psw, '密码不能为空');
    const hashedPassword = await Argon2.hashPassword(password)
    const user = await dbModel.register({
        name,
        password:hashedPassword,
        moment: req.body.moment || new Date().toISOString(),
    });
    success(res, { id: user.id, name: user.name }, '注册成功');
};

// 管理员登录接口：校验账号密码，成功后生成 JWT
exports.adminSignin = async (req, res) => {
    const name = requireValue(req.body.name, '账号不能为空');
    const password = requireValue(req.body.password || req.body.psw, '密码不能为空');
    const user = await dbModel.adminSignin(name);
    if (!user || !(await Argon2.comparePasswords(user.password, password))) {
        const error = new Error('账号或密码错误');
        error.status = 401;
        throw error;
    }
    const token = jwt.generateToken(user.name);
    success(res, { id: user.id, name: user.name, token }, '登录成功');
};

// 获取评论接口：分页返回评论、评论用户和所属文章标题
exports.getComment = async (req, res) => {
    const data = await dbModel.getCommentPage(req.body.pageSize, req.body.nowPage);
    success(res, data);
};

// 删除评论接口：根据评论 id 删除一条评论
exports.deleteComment = async (req, res) => {
    const affected = await dbModel.deleteComment(req.body.id ?? req.body.commentId);
    success(res, { affected }, affected ? '评论删除成功' : '评论不存在');
};

// 获取私信接口：分页返回私信，并把当前页未读私信标为已读
exports.getMessage = async (req, res) => {
    const data = await dbModel.getMessagePage(req.body.pageSize, req.body.nowPage);
    // 仅更新当前页中未读的私信，避免重复写库
    const ids = data.list.filter((item) => item.isread === 0).map((item) => item.id);
    await Promise.all(ids.map((id) => dbModel.updateMessageRead(id)));
    success(res, data);
};

// 删除私信接口：根据私信 id 删除一条私信
exports.deleteMessage = async (req, res) => {
    const affected = await dbModel.deleteMessage(req.body.id ?? req.body.messageId);
    success(res, { affected }, affected ? '私信删除成功' : '私信不存在');
};

// 获取文章接口：查询文章或图库列表，同时返回总数和互动数量
exports.getArticle = async (req, res) => {
    const data = await dbModel.getArticlePage(req.body);
    // 同时返回 list 和 result，兼容新接口与旧页面字段
    success(res, { ...data, result: data.list });
};

// 修改文章状态接口：state 为 0 表示未发布，为 1 表示已发布
exports.changeArticleState = async (req, res) => {
    const id = req.body.articleId ?? req.body.id;
    const { state } = req.body;
    // 发布文章前先复制一次 Markdown 快照。图库仍走原有状态逻辑，
    // 因此这里只在 classify=0 的文章上访问文章正文对象。
    if (Number(state) === 1) {
        const article = await dbModel.gainArticle(id)
        if (article?.classify === 0) {
            const draft = await articleContent.readDraft(id)
            // 旧文章没有 draft.md 时继续沿用 article.content 发布；
            // 新文章如果既没有草稿也没有旧正文，则拒绝发布空文章。
            if (draft !== null && draft.trim()) await articleContent.publishDraft(id)
            else if (!article.content) {
                const error = new Error('请先保存文章正文')
                error.status = 400
                throw error
            }
        }
    }
    const [affected] = await dbModel.changeArticleState(id, state);
    success(res, { affected }, affected ? '文章状态修改成功' : '文章不存在');
};

// 删除文章接口：删除文章并清理关联点赞、评论
exports.deleteArticle = async (req, res) => {
    const articleId = req.body.articleId ?? req.body.id
    const affected = await dbModel.deleteArticle(articleId);
    // 数据库删除成功后再清理 RustFS，避免数据库仍引用已不存在正文。
    // both operations are best-effort after the row is gone; failures are logged below.
    if (affected) {
        const results = await Promise.allSettled([
            articleContent.deleteArticleContent(articleId),
            media.deleteArticleFiles(articleId),
        ])
        results
            .filter((result) => result.status === 'rejected')
            .forEach((result) => console.error('文章资源清理失败:', result.reason))
    }
    success(res, { affected }, affected ? '文章删除成功' : '文章不存在');
};

// 文章状态统计接口：返回已发布和未发布文章总数
exports.getArticleStateCount = async (req, res) => {
    success(res, await dbModel.getArticleStateCounts());
};

// 获取分类接口：返回指定类型下的分类列表和每类内容数量
exports.getCategory = async (req, res) => {
    const classify = Number(req.body.classify ?? req.query.classify ?? 0);
    success(res, await dbModel.getCategoryStats(classify));
};

// 新建分类接口：新增文章、图库或资源分类
exports.addCategory = async (req, res) => {
    const value = req.body.value || req.body;
    requireValue(value.name ?? value.category_name, '分类名称不能为空');
    const category = await dbModel.addCategory(value);
    success(res, category, '新建分类成功');
};

// 修改分类名称接口：根据 categoryId 修改分类名称
exports.updateCategoryName = async (req, res) => {
    const id = req.body.categoryId ?? req.body.id;
    const name = requireValue(req.body.categoryName ?? req.body.name, '分类名称不能为空');
    const [affected] = await dbModel.updateCategoryName(id, name);
    success(res, { affected }, affected ? '修改分类名称成功' : '分类不存在');
};

// 删除分类接口：删除分类，关联文章和文件自动变为未分类
exports.deleteCategory = async (req, res) => {
    const affected = await dbModel.deleteCategory(req.body.categoryId ?? req.body.id);
    success(res, { affected }, affected ? '分类删除成功' : '分类不存在');
};

// 获取标签接口：查询全部文章标签
exports.getLabel = async (req, res) => {
    success(res, await dbModel.getLabel());
};

// 新建标签接口：把新标签写入 label 表
exports.addLabel = async (req, res) => {
    const value = req.body.value || req.body;
    // [联调修复] 原实现误调用 addCategory，导致标签被写进分类表。
    requireValue(value.name ?? value.label_name, '标签名称不能为空');
    const label = await dbModel.addLabel(value);
    success(res, label, '新建标签成功');
};

// 删除标签接口：根据 labelId 删除标签
exports.deleteLabel = async (req, res) => {
    const affected = await dbModel.deleteLabel(req.body.labelId ?? req.body.id);
    success(res, { affected }, affected ? '标签删除成功' : '标签不存在');
};

// 获取文件接口：分页查询本地文件，并按分类筛选
exports.getFilePage = async (req, res) => {
    const data = await dbModel.getFilePage(req.body);
    const list = data.list.map(media.serializeFile)
    success(res, { 
        ...data, 
        list,
        result: list 
    });
};

// 移动文件接口：把单个或批量文件移动到指定分类
exports.moveFile = async (req, res) => {
    const [affected] = await dbModel.moveFile(
        req.body.fileId ?? req.body.fileIds,
        req.body.categoryId,
    );
    success(res, { affected }, affected ? '移动文件成功' : '文件不存在');
};

// 删除文件接口：先删除数据库记录，再删除 rustFs 中的实体文件
exports.deleteFile = async (req, res) => {
    // 先删除数据库记录，再清理RustFS，避免保留失效文件地址
    const ids = req.body.fileId ?? req.body.fileIds
    const files = await dbModel.getFilesByIds(ids)
    if (!files.length) {
        return success(res, { affected: 0 }, '文件不存在')
    }
    //删除
    await media.deleteStoredFiles(files)
    const affected = await dbModel.deleteFile(ids)
    return success(res, { affected }, '文件删除成功');
};

// 文件上传接口：接收 multer 处理的文件并写入 local_file 表
exports.uploadFile = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        const error = new Error('请选择要上传的文件');
        error.status = 400;
        throw error;
    }
    const categoryId = Number(req.body.categoryId);
    // multer 只负责落盘，这里补充数据库需要的名称、格式和分类
    const values = req.files.map((file) => {
        const parsed = path.parse(file.originalname);
        return {
            url: `/files/${file.filename}`,
            fileName: parsed.name,
            format: parsed.ext.replace('.', '').toLowerCase() || 'unknown',
            categoryId: categoryId >= 0 ? categoryId : null,
            moment: new Date().toISOString(),
        };
    });
    const files = await dbModel.uploadFiles(values);
    success(res, files, '上传文件成功');
};

// 获取日记接口：分页查询日记，支持标题和正文搜索
exports.getDiaryPage = async (req, res) => {
    const data = await dbModel.getDiaryPage(req.body);
    success(res, { ...data, result: data.list });
};

// 新建日记接口：保存标题、正文、天气和本地图片地址
exports.createDiary = async (req, res) => {
    const value = req.body.value || req.body;
    requireValue(value.title, '标题不能为空');
    const diary = await dbModel.createDiary(value);
    success(res, diary, '新建日记成功');
};

// 删除日记接口：根据 diaryId 删除一条日记
exports.deleteDiary = async (req, res) => {
    const affected = await dbModel.deleteDiary(req.body.diaryId ?? req.body.id);
    success(res, { affected }, affected ? '日记删除成功' : '日记不存在');
};

// 新建文章/图库接口：根据 classify 区分文章和摄影图库
exports.createArticle = async (req, res) => {
    const value = req.body.value || req.body;
    requireValue(value.title, '标题不能为空');
    const markdownProvided = hasMarkdown(value)
    const article = await dbModel.createArticle(articleMetadata(value, markdownProvided));
    if (Number(article.classify) === 0 && markdownProvided) {
        try {
            await articleContent.saveDraft(article.id, value.markdown)
        } catch (error) {
            // 正文写入失败时撤回刚创建的空文章和图片记录，避免留下不可用草稿。
            await Promise.allSettled([
                dbModel.deleteArticle(article.id),
                media.deleteArticleFiles(article.id),
            ])
            throw error
        }
    }
    success(res, article, '新建文章/图库成功');
};

// 获取文章/图库详情接口：返回编辑页所需的单条完整数据
exports.gainArticle = async (req, res) => {
    const article = await dbModel.gainArticle(req.body.articleId ?? req.body.id);
    if (!article) {
        const error = new Error('文章不存在');
        error.status = 404;
        throw error;
    }
    // 图库正文仍是本地文件数组，只有 classify=0 的文章需要读取 Markdown。
    if (article.classify !== 0) return success(res, article)
    const draft = await articleContent.readDraft(article.id)
    const meta = draft === null ? null : await articleContent.getDraftMeta(article.id)
    success(res, {
        ...article,
        // markdown 供编辑保存时保留原始正文，contentHtml 供 WangEditor 回填。
        markdown: draft ?? '',
        contentHtml: draft === null ? article.content || '' : articleContent.renderMarkdown(draft),
        savedAt: meta?.lastModified ? new Date(meta.lastModified).toISOString() : null,
    });
};

// 修改文章/图库接口：更新标题、分类、标签、正文、封面或状态
exports.updateArticle = async (req, res) => {
    const value = req.body.value || req.body;
    const articleId = req.body.articleId ?? req.body.id
    const markdownProvided = hasMarkdown(value)
    if (markdownProvided) {
        const article = await dbModel.gainArticle(articleId)
        if (article?.classify === 0) await articleContent.saveDraft(articleId, value.markdown)
    }
    const affected = await dbModel.updateArticle(articleId, articleMetadata(value, markdownProvided));
    success(res, { affected }, affected ? '修改文章/图库成功' : '文章不存在');
};

// 获取天气接口：返回日记页面可选择的天气及图标
exports.getWeather = async (req, res) => {
    success(res, await dbModel.getWeather());
};

// 总览数据接口：统计文章、图库、日记数量和本地文件夹大小
exports.getOverview = async (req, res) => {
    // 内容统计和文件大小互不依赖，并行查询减少等待时间
    const [counts, bytes] = await Promise.all([
        dbModel.getOverviewCounts(),
        dbModel.getStorageBytes(),
    ]);
    success(res, {
        ...counts,
        file: handleFile.formatSize(bytes),
    });
};

// 访问量接口：返回最近一周或最近一月的每日访问量
exports.getVisits = async (req, res) => {
    success(res, await dbModel.getVisits(req.body.length));
};

// 数据监测接口：返回移动端、PC 端及网站内容数量分布
exports.getSurvey = async (req, res) => {
    success(res, await dbModel.getSurvey(req.body.length));
};
