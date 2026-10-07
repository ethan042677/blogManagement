//全局配置项
const config = {
    port:3000,
    //链接数据库相关配置
    database:{
        HOST:"localhost",//数据库服务器地址
        USER:"root",//数据库的用户名
        PASSWORD:"123456",//数据库的密码
        DATABASE:"blog_base",//数据库名
        PORT:3308
    }
}

module.exports = config;