const express = require('express');
const app = express();
const path = require('path');
const config = require('./config/default');

/**引入静态文件 */
//设置静态目录
app.use(express.static(path.join(__dirname, 'public')));




app.get('/', (req, res) => {
    res.send('Hello World12342');
});

app.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}`);
});