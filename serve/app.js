const express = require('express');
const app = express();
const path = require('path');
const config = require('./config/default');
const cors = require('cors');
const bodyParser = require('body-parser')
const jwt = require('./utils/jsonwebtoken')

/**引入静态文件 */
//设置静态目录
app.use(express.static(path.join(__dirname, 'public')));

/**设置跨域 */
// 使用cors中间件,配置跨域，允许所有来源跨域
app.use(cors());

/**解析前端数据 */
//解析application/x-www-form-urlencoded数据格式
app.use(bodyParser.urlencoded({extended:true}))
//解析json数据格式
app.use(bodyParser.json())
//解析text/plain数据格式
app.use(bodyParser.text())

/**token处理（使用全局中间件） */
app.use(async (req,res,next)=>{
    //如果有token则验证，没有则直接放行
    if(req.body.token !== undefined){
        const token = req.body.token
        const isPass = jwt.verifyToken(token)
        if(isPass){
            next();//验证通过
        }else{
            res.send({
                code:401,
                msg:"验证未通过"
            })
        }
    }else{
        next();//没有token，无需验证，直接放行
    }
})

/**引入路由 */
require('./routes/index')(app);

app.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}`);
});