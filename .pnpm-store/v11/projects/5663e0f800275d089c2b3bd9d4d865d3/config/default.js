//全局配置项
const config = {
    port:Number(process.env.PORT || 3000),
    //链接数据库相关配置
    database:{
        HOST:process.env.DB_HOST || "localhost",//数据库服务器地址
        USER:process.env.DB_USER || "root",//数据库的用户名
        PASSWORD:process.env.DB_PASSWORD || "123456",//数据库的密码
        DATABASE:process.env.DB_NAME || "blog_base",//数据库名
        PORT:Number(process.env.DB_PORT || 3308),
        LOGGING:process.env.DB_LOGGING === 'true'
    },
    // [联调修复] JWT 密钥允许通过环境变量覆盖，避免把生产密钥硬编码。
    jwtSecret:process.env.JWT_SECRET || 'blog-management-local-secret'
}

module.exports = config;
