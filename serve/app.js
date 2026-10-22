// [联调改造] 服务启动入口：先初始化 Sequelize，再监听端口；统一返回 JSON 错误。
const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./config/default');
const initDatabase = require('./models/initDatabase');

const app = express();

// 允许前端跨域访问接口
app.use(cors());
// 解析 JSON、表单和纯文本请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text({ type: 'text/plain', limit: '10mb' }));
// 把本地文件目录开放为静态资源，例如 /files/a.png
app.use('/files', express.static(path.join(__dirname, 'public/files')));
app.use(express.static(path.join(__dirname, 'public')));

// 注册业务接口和文件上传接口
app.use('/', require('./routes/index'));
app.use('/', require('./routes/files'));

// 未匹配到任何接口时返回 404
app.use((req, res) => {
    // 所有未匹配的地址统一返回 JSON，便于前端处理
    res.status(404).send({ code: 404, msg: '接口不存在' });
});

// 统一错误处理中间件，避免错误信息直接暴露给前端
app.use((error, req, res, next) => {
    console.error(error);
    if (res.headersSent) return next(error);
    res.status(error.status || 500).send({
        code: error.status || 500,
        msg: error.status ? error.message : '服务器内部错误',
    });
});

// 启动服务前先完成 Sequelize 初始化和演示数据检查
async function start() {
    await initDatabase();
    app.listen(config.port, () => {
        console.log(`Blog API listening on http://localhost:${config.port}`);
    });
}

start().catch((error) => {
    console.error('服务启动失败:', error);
    process.exit(1);
});

module.exports = app;
