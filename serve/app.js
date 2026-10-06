const express = require('express');
const app = express();
const path = require('path');
const config = require('./config/default');
const cors = require('cors');

/**引入静态文件 */
//设置静态目录
app.use(express.static(path.join(__dirname, 'public')));

/**设置跨域 */
// 使用cors中间件,配置跨域，允许所有来源跨域
app.use(cors());

/**解析前端数据 */
app.use(express.json());//解析位：request.body

/**引入路由 */
require('./routes/index')(app);

app.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}`);
});