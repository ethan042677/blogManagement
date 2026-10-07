const {Mysql,createDataBase} = require('./mysql');

/**数据库 */
const blog_base = `CREATE DATABASE IF NOT EXISTS blog_base
                    CHARACTER SET utf8mb4
                    COLLATE utf8mb4_general_ci;`;
/**数据表 */
const users = 
    `CREATE TABLE IF NOT EXISTS users(
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    moment VARCHAR(100) NOT NULL COMMENT '时间',
    PRIMARY KEY (id)
    );`

const category = 
    `CREATE TABLE IF NOT EXISTS category(
    id INT NOT NULL AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    classify INT NOT NULL COMMENT '类型0文章1图片2资源',
    moment VARCHAR(100) NOT NULL COMMENT '时间',
    PRIMARY KEY (id)
    );`

const local_file = 
    `CREATE TABLE IF NOT EXISTS local_file(
    id INT NOT NULL AUTO_INCREMENT,
    url VARCHAR(100) NOT NULL COMMENT '地址',
    file_name VARCHAR(100) NOT NULL COMMENT '名称',
    format VARCHAR(32) NOT NULL COMMENT '格式',
    category_id INT COMMENT '所属分类',
    moment VARCHAR(100) NOT NULL COMMENT '时间',
    PRIMARY KEY (id)
    );`

let article = 
    `CREATE TABLE IF NOT EXISTS article(
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT '标题',
    category_id INT COMMENT '所属分类',
    classify INT NOT NULL COMMENT '类型0文章1图片2资源',
    label VARCHAR(200) COMMENT '标签',
    introduction VARCHAR(1000) COMMENT '简介',
    content VARCHAR(5000) COMMENT '内容',
    cover VARCHAR(100) COMMENT '封面地址',
    views INT DEFAULT 0 COMMENT '查看次数',
    state INT DEFAULT 0 COMMENT '文章状态',
    moment VARCHAR(100) NOT NULL COMMENT '时间',
    PRIMARY KEY (id)
    );`

const praise = 
    `CREATE TABLE IF NOT EXISTS praise(
    id INT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(100) NOT NULL COMMENT '用户',
    views INT NOT NULL COMMENT '查看次数',
    article_id INT NOT NULL COMMENT '所属文章',
    moment VARCHAR(100) NOT NULL COMMENT '时间',
    PRIMARY KEY (id)
    );`

const comment = 
    `CREATE TABLE IF NOT EXISTS comment(
    id INT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(100) NOT NULL COMMENT '用户',
    user_name VARCHAR(100) COMMENT '用户名称',
    user_category INT NOT NULL COMMENT '用户类型',
    article_id INT NOT NULL COMMENT '所属文章',
    moment VARCHAR(100) NOT NULL COMMENT '时间',
    content VARCHAR(5000) COMMENT '内容',
    complaint INT DEFAULT 0 COMMENT '举报次数',
    isread INT DEFAULT 0 COMMENT '是否已读',
    PRIMARY KEY (id)
    );`

const label = 
    `CREATE TABLE IF NOT EXISTS label(
    id INT NOT NULL AUTO_INCREMENT,
    label_name VARCHAR(100) NOT NULL COMMENT '名称',
    moment VARCHAR(100) NOT NULL COMMENT '时间',
    PRIMARY KEY (id)
    );`

const diary = 
    `CREATE TABLE IF NOT EXISTS diary(
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT '标题',
    content VARCHAR(5000) COMMENT '内容',
    picture VARCHAR(500) COMMENT '图片地址',
    weather_id INT COMMENT '天气',
    mood INT DEFAULT 0 COMMENT '心情',
    moment VARCHAR(100) NOT NULL COMMENT '时间',
    PRIMARY KEY (id)
    );`

const weather = 
    `CREATE TABLE IF NOT EXISTS weather(
    id INT NOT NULL AUTO_INCREMENT,
    weather_name VARCHAR(32) NOT NULL COMMENT '名称',
    icon VARCHAR(100) COMMENT '图标',
    PRIMARY KEY (id)
    );`

const message = 
    `CREATE TABLE IF NOT EXISTS message(
    id INT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(100) NOT NULL COMMENT '用户',
    user_category INT NOT NULL COMMENT '用户类型',
    user_name VARCHAR(100) COMMENT '用户名称',
    moment VARCHAR(100) NOT NULL COMMENT '时间',
    content VARCHAR(5000) COMMENT '内容',
    isread INT DEFAULT 0 COMMENT '是否已读',
    PRIMARY KEY (id)
    );`

const record = 
    `CREATE TABLE IF NOT EXISTS record(
    id INT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(100) NOT NULL COMMENT '用户',
    user_category INT NOT NULL COMMENT '用户类型',
    position VARCHAR(100) COMMENT '位置',
    isread INT DEFAULT 0 COMMENT '设备',
    moment VARCHAR(100) NOT NULL COMMENT '时间',
    PRIMARY KEY (id)
    );`

/**创建数据表 */
const createTable = (sql)=>{
    return Mysql.query(sql,[]);
}

/**先创建数据库，再创建表 */
async function create(){
    await createDataBase(blog_base);
    await createTable(users);
    await createTable(category);
    await createTable(local_file);
    await createTable(article);
    await createTable(praise);
    await createTable(comment);
    await createTable(label);
    await createTable(diary);
    await createTable(weather);
    await createTable(message);
    await createTable(record);
}

//开启连接数据库
create().then(() => {
    console.log('数据库和表初始化完成');
}).catch((err) => {
    console.error('初始化失败:', err);
    process.exit(1);  // 初始化失败就别让服务继续跑
});