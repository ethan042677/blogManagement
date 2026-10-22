// [联调新增] 全站数据库统一使用 Sequelize，业务代码不再拼接 SQL。
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/default');

const sequelize = new Sequelize(
    config.database.DATABASE,
    config.database.USER,
    config.database.PASSWORD,
    {
        // 使用本地 MySQL 和连接池，日志默认关闭避免刷屏
        host: config.database.HOST,
        port: config.database.PORT,
        dialect: 'mysql',
        logging: config.database.LOGGING ? console.log : false,
        define: {
            freezeTableName: true,
            timestamps: false,
            underscored: true,
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    },
);

const commonOptions = {
    // 现有表自行维护 moment 字段，不启用 Sequelize 自动时间戳
    timestamps: false,
};

// [联调修复] 模型属性使用 camelCase，field 映射旧数据库的 snake_case，
// 这样接口无需再手工转换字段名。
// 管理员表：保存后台登录账号、密码和创建时间
const User = sequelize.define('users', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(100), allowNull: false },
    moment: { type: DataTypes.STRING(100), allowNull: false },
}, commonOptions);

// 分类表：classify 为 0 文章、1 图库、2 资源
const Category = sequelize.define('category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, field: 'category_name' },
    classify: { type: DataTypes.INTEGER, allowNull: false },
    moment: { type: DataTypes.STRING(100), allowNull: false },
}, commonOptions);

// 本地文件表：保存 public/files 下的文件地址和分类
const LocalFile = sequelize.define('local_file', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    url: { type: DataTypes.STRING(255), allowNull: false },
    fileName: { type: DataTypes.STRING(100), allowNull: false, field: 'file_name' },
    format: { type: DataTypes.STRING(32), allowNull: false },
    categoryId: { type: DataTypes.INTEGER, allowNull: true, field: 'category_id' },
    moment: { type: DataTypes.STRING(100), allowNull: false },
}, commonOptions);

// 文章/图库表：通过 classify 区分文章和摄影图库
const Article = sequelize.define('article', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    categoryId: { type: DataTypes.INTEGER, allowNull: true, field: 'category_id' },
    classify: { type: DataTypes.INTEGER, allowNull: false },
    label: { type: DataTypes.STRING(200), allowNull: true },
    introduction: { type: DataTypes.STRING(1000), allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: true },
    cover: { type: DataTypes.STRING(255), allowNull: true },
    views: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    state: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    moment: { type: DataTypes.STRING(100), allowNull: false },
}, commonOptions);

// 点赞表：保存文章点赞者和点赞时间
const Praise = sequelize.define('praise', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.STRING(100), allowNull: false, field: 'user_id' },
    userCategory: { type: DataTypes.INTEGER, allowNull: false, field: 'views' },
    articleId: { type: DataTypes.INTEGER, allowNull: false, field: 'article_id' },
    moment: { type: DataTypes.STRING(100), allowNull: false },
}, commonOptions);

// 评论表：保存评论用户、内容、举报数和已读状态
const Comment = sequelize.define('comment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.STRING(100), allowNull: false, field: 'user_id' },
    userName: { type: DataTypes.STRING(100), allowNull: true, field: 'user_name' },
    userCategory: { type: DataTypes.INTEGER, allowNull: false, field: 'user_category' },
    articleId: { type: DataTypes.INTEGER, allowNull: false, field: 'article_id' },
    moment: { type: DataTypes.STRING(100), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: true },
    complaint: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    isread: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, commonOptions);

// 标签表：保存文章标签名称
const Label = sequelize.define('label', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, field: 'label_name', unique: true },
    moment: { type: DataTypes.STRING(100), allowNull: false },
}, commonOptions);

// 日记表：保存标题、正文、天气和本地图片
const Diary = sequelize.define('diary', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: true },
    picture: { type: DataTypes.STRING(500), allowNull: true },
    weatherId: { type: DataTypes.INTEGER, allowNull: true, field: 'weather_id' },
    mood: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    moment: { type: DataTypes.STRING(100), allowNull: false },
}, commonOptions);

// 天气表：保存天气名称和图标地址
const Weather = sequelize.define('weather', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(32), allowNull: false, field: 'weather_name' },
    icon: { type: DataTypes.STRING(100), allowNull: true },
}, commonOptions);

// 私信表：保存访问者私信内容和已读状态
const Message = sequelize.define('message', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.STRING(100), allowNull: false, field: 'user_id' },
    userCategory: { type: DataTypes.INTEGER, allowNull: false, field: 'user_category' },
    userName: { type: DataTypes.STRING(100), allowNull: true, field: 'user_name' },
    moment: { type: DataTypes.STRING(100), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: true },
    isread: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, commonOptions);

// 访问记录表：用于访问量和设备分布统计
const Record = sequelize.define('record', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.STRING(100), allowNull: false, field: 'user_id' },
    userCategory: { type: DataTypes.INTEGER, allowNull: false, field: 'user_category' },
    position: { type: DataTypes.STRING(100), allowNull: true },
    device: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'isread' },
    moment: { type: DataTypes.STRING(100), allowNull: false },
}, commonOptions);

// [联调新增] 供评论列表直接带出文章标题，并在删除文章时级联清理互动数据。
// 文章与评论关联：删除文章时可查询和清理对应评论
Article.hasMany(Comment, { foreignKey: 'articleId', as: 'comments' });
// 评论与文章关联：评论列表可以直接返回文章标题
Comment.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });
// 文章与点赞关联：用于统计单篇文章点赞数
Article.hasMany(Praise, { foreignKey: 'articleId', as: 'praises' });
// 点赞与文章关联
Praise.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });

module.exports = {
    sequelize,
    Sequelize,
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
