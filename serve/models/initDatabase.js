// [联调新增] Sequelize 建表、关联与可重复执行的基础数据初始化。
const fs = require('fs');
const path = require('path');
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

const uploadDirectory = path.join(__dirname, '../public/files');

const isoMoment = (date = new Date()) => date.toISOString();
const daysAgo = (days, hour = 10) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(hour, 0, 0, 0);
    return date;
};
const dateKey = (date) => date.toISOString().slice(0, 10);

// 初始化天气数据
async function seedWeather() {
    const weatherList = [
        ['晴天', 'weather/sun.svg'],
        ['多云', 'weather/cloudy.svg'],
        ['阴天', 'weather/overcast.svg'],
        ['雾霾', 'weather/smog.svg'],
        ['下雨', 'weather/rain.svg'],
        ['雷雨', 'weather/thunderstorm.svg'],
        ['下雪', 'weather/snow.svg'],
        ['有风', 'weather/wind.svg'],
    ];

    for (const [name, icon] of weatherList) {
        // 按天气名称去重，重复启动不会新增重复数据
        await Weather.findOrCreate({ where: { name }, defaults: { name, icon } });
    }
}

// 初始化本地演示管理员
async function seedUser() {
    // [联调说明] 仅用于本地演示；生产环境应改为 bcrypt/argon2 哈希密码。
    // 按用户名查找，已存在时保留原账号密码
    await User.findOrCreate({
        where: { name: 'tom' },
        defaults: {
            name: 'tom',
            password: '123456',
            moment: isoMoment(),
        },
    });
}

// 初始化文章、图库和资源分类
async function seedCategories() {
    const categories = [
        ['生活随笔', 0],
        ['技术复盘', 0],
        ['城市漫游', 1],
        ['自然风光', 1],
        ['设计素材', 2],
        ['文档资料', 2],
    ];

    for (const [name, classify] of categories) {
        // 分类名称和类型同时匹配时才视为已存在
        await Category.findOrCreate({
            where: { name, classify },
            defaults: { name, classify, moment: isoMoment() },
        });
    }
}

// 初始化演示文章和摄影图库
async function seedArticles() {
    const articleCategories = await Category.findAll({ where: { classify: 0 } });
    const galleryCategories = await Category.findAll({ where: { classify: 1 } });
    const lifeCategory = articleCategories.find((item) => item.name === '生活随笔');
    const techCategory = articleCategories.find((item) => item.name === '技术复盘');
    const cityCategory = galleryCategories.find((item) => item.name === '城市漫游');
    const natureCategory = galleryCategories.find((item) => item.name === '自然风光');

    const articles = [
        {
            title: '秋日散步',
            classify: 0,
            categoryId: lifeCategory?.id,
            label: '生活,散步',
            introduction: '沿着河岸慢慢走，把日常里容易被忽略的光影收集起来。',
            content: '风从水面吹来时，城市的声音忽然变得很远。',
            cover: '/files/a.png',
            views: 128,
            state: 1,
            moment: isoMoment(daysAgo(2)),
        },
        {
            title: 'Sequelize 联调记录',
            classify: 0,
            categoryId: techCategory?.id,
            label: 'Node.js,ORM',
            introduction: '记录将手写 SQL 迁移到 Sequelize 模型时的字段映射与查询调整。',
            content: '模型字段保持 camelCase，数据库列继续使用 snake_case。',
            cover: '/files/b.png',
            views: 86,
            state: 1,
            moment: isoMoment(daysAgo(5)),
        },
        {
            title: '周末的咖啡店',
            classify: 0,
            categoryId: lifeCategory?.id,
            label: '周末,咖啡',
            introduction: '窗外下着细雨，适合整理照片和未完成的笔记。',
            content: '一杯咖啡、一本书，还有一下午安静的雨声。',
            cover: '/files/c.png',
            views: 52,
            state: 0,
            moment: isoMoment(daysAgo(8)),
        },
        {
            title: '城市边缘的傍晚',
            classify: 1,
            categoryId: cityCategory?.id,
            label: '城市,傍晚',
            introduction: '下班后的城市被余晖切成明暗分明的色块。',
            content: JSON.stringify(['/files/a.png', '/files/b.png', '/files/c.png']),
            cover: '/files/a.png',
            views: 204,
            state: 1,
            moment: isoMoment(daysAgo(1)),
        },
        {
            title: '山野与云',
            classify: 1,
            categoryId: natureCategory?.id,
            label: '山野,云',
            introduction: '清晨的云层从山脊上缓慢升起。',
            content: JSON.stringify(['/files/d.png', '/files/e.png', '/files/f.png']),
            cover: '/files/d.png',
            views: 176,
            state: 1,
            moment: isoMoment(daysAgo(4)),
        },
        {
            title: '路边的绿色',
            classify: 1,
            categoryId: natureCategory?.id,
            label: '植物,日常',
            introduction: '一次普通的通勤，也可以遇到鲜活的颜色。',
            content: JSON.stringify(['/files/e.png', '/files/f.png']),
            cover: '/files/e.png',
            views: 93,
            state: 1,
            moment: isoMoment(daysAgo(7)),
        },
        {
            title: '旧街角',
            classify: 1,
            categoryId: cityCategory?.id,
            label: '街拍,建筑',
            introduction: '保留城市里那些有时间痕迹的转角。',
            content: JSON.stringify(['/files/c.png', '/files/a.png']),
            cover: '/files/c.png',
            views: 61,
            state: 0,
            moment: isoMoment(daysAgo(10)),
        },
    ];

    for (const data of articles) {
        // [联调新增] 按标题和类型幂等写入，重复启动不会制造重复假数据。
        await Article.findOrCreate({
            where: { title: data.title, classify: data.classify },
            defaults: data,
        });
    }
}

// 初始化文章标签
async function seedLabels() {
    const names = ['生活', '技术', '摄影', '旅行', '读书'];
    for (const name of names) {
        await Label.findOrCreate({
            where: { name },
            defaults: { name, moment: isoMoment() },
        });
    }
}

// 初始化本地文件记录
async function seedFiles() {
    const resourceCategory = await Category.findOne({ where: { name: '设计素材', classify: 2 } });
    const fileCategories = await Category.findAll({ where: { classify: 2 } });
    const files = [
        ['/files/a.png', '城市光影', 'png'],
        ['/files/b.png', '午后街景', 'png'],
        ['/files/c.png', '窗边植物', 'png'],
        ['/files/d.png', '远山', 'png'],
        ['/files/e.png', '绿色角落', 'png'],
        ['/files/f.png', '日常记录', 'png'],
    ];

    for (let index = 0; index < files.length; index += 1) {
        const [url, fileName, format] = files[index];
        await LocalFile.findOrCreate({
            where: { url },
            defaults: {
                url,
                fileName,
                format,
                categoryId: (index === files.length - 1 ? fileCategories[1] : resourceCategory)?.id,
                moment: isoMoment(daysAgo(index)),
            },
        });
    }
}

// 初始化演示日记
async function seedDiary() {
    const diaries = [
        ['今天的风很轻', '傍晚绕湖走了一圈，树叶的声音比平时更清楚。', ['/files/a.png']],
        ['整理房间', '把旧照片按时间重新排了一遍，也顺便整理了自己的心情。', ['/files/c.png', '/files/f.png']],
        ['小雨', '没有带伞，但雨落在树叶上的样子值得停下来看看。', ['/files/b.png']],
    ];

    for (let index = 0; index < diaries.length; index += 1) {
        const [title, content, pictures] = diaries[index];
        await Diary.findOrCreate({
            where: { title },
            defaults: {
                title,
                content,
                picture: pictures.join(','),
                weatherId: index,
                mood: 1,
                moment: isoMoment(daysAgo(index + 1, 20)),
            },
        });
    }
}

// 初始化评论、点赞和私信演示数据
async function seedInteractions() {
    const articles = await Article.findAll({ include: [{ association: 'comments', required: false }] });
    if (articles.length === 0) return;
    const firstArticle = articles[0];

    if (await Comment.count() < 4) {
        // 评论分别挂到不同文章，便于验证关联标题
        const comments = [
            ['小林', '这组照片的光线很舒服。', 0],
            ['Luna', '看文字的时候也像跟着走了一段路。', 1],
            ['阿川', '期待下一篇联调记录。', 0],
        ];
        for (let index = 0; index < comments.length; index += 1) {
            const [userName, content, complaint] = comments[index];
            const exists = await Comment.findOne({ where: { userName, content } });
            if (!exists) {
                await Comment.create({
                    userId: String(index + 2),
                    userName,
                    userCategory: 0,
                    articleId: articles[index % articles.length].id,
                    moment: isoMoment(daysAgo(index, 14)),
                    content,
                    complaint,
                    isread: index % 2,
                });
            }
        }
    }

    if (await Praise.count() === 0) {
        await Praise.bulkCreate([
            { userId: 'visitor-1', userCategory: 1, articleId: firstArticle.id, moment: isoMoment(daysAgo(2)) },
            { userId: 'visitor-2', userCategory: 1, articleId: firstArticle.id, moment: isoMoment(daysAgo(3)) },
            { userId: 'visitor-3', userCategory: 1, articleId: firstArticle.id, moment: isoMoment(daysAgo(4)) },
        ]);
    }

    if (await Message.count() === 0) {
        await Message.bulkCreate([
            {
                userId: 'visitor-8',
                userCategory: 1,
                userName: '旅人',
                moment: isoMoment(daysAgo(1, 18)),
                content: '想请教一下图库页面的照片授权方式。',
                isread: 0,
            },
            {
                userId: 'visitor-9',
                userCategory: 1,
                userName: 'Bear',
                moment: isoMoment(daysAgo(4, 11)),
                content: '后台整理得很清楚，期待更多文章。',
                isread: 1,
            },
        ]);
    }
}

// 初始化最近 30 天访问记录
async function seedRecords() {
    if (await Record.count() > 0) return;

    const records = [];
    // 生成最近 30 天访问记录，日期和访问量保持可重复
    for (let day = 29; day >= 0; day -= 1) {
        const dailyCount = 18 + ((29 - day) * 3) % 31;
        for (let index = 0; index < dailyCount; index += 1) {
            const date = daysAgo(day, 8 + (index % 14));
            records.push({
                userId: `visitor-${day}-${index}`,
                userCategory: 1,
                position: index % 4 === 0 ? 'article' : index % 4 === 1 ? 'gallery' : index % 4 === 2 ? 'diary' : 'overview',
                device: index % 3 === 0 ? 1 : 0,
                moment: isoMoment(date),
            });
        }
    }
    await Record.bulkCreate(records);
}

// 数据库总初始化：连接、建表、检查和填充演示数据
async function initDatabase() {
    fs.mkdirSync(uploadDirectory, { recursive: true });
    await sequelize.authenticate();
    // [联调说明] 使用 sync 而非 alter，避免自动修改已有生产数据表结构。
    await sequelize.sync();
    await seedUser();
    await seedWeather();
    await seedCategories();
    await seedArticles();
    await seedLabels();
    await seedFiles();
    await seedDiary();
    await seedInteractions();
    await seedRecords();
    console.log('Sequelize 数据库初始化与种子数据检查完成');
}

module.exports = initDatabase;
