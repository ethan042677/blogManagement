const DB = require('./mysql')

//查询数据库中是否有注册用户
exports.isRegister = ()=>{
    const _sql = `SELECT count(*) as count FROM users;`
    return DB.Mysql.query(_sql)
}

//管理员注册
exports.register = (val)=>{
    const _sql = `INSERT INTO users SET ?;`
    return DB.Mysql.query(_sql,val)
}

//管理员登录（查找库中是否有此管理员）
exports.adminSignin = (name)=>{
    const _sql = `SELECT * FROM users WHERE name = ?;`
    return DB.Mysql.query(_sql,[name])
}

/**评论接口 */
//获取评论（拿到数据库中的评论）
exports.getCommentPage = (pageSize,nowPage)=>{
    const _sql = `SELECT * FROM comment ORDER BY id DESC LIMIT ${(nowPage - 1) * pageSize},${pageSize};`
    return DB.Mysql.query(_sql)
}
//获取评论总条数
exports.getCommentCount = ()=>{
    const _sql = `SELECT COUNT(*) AS count FROM comment;`
    return DB.Mysql.query(_sql);
}
//获取文字名称
exports.getArticleTitle = (id) => {
    const _sql = `SELECT title FROM article WHERE id = ${id};`
    return DB.Mysql.query(_sql)
}