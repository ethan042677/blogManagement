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
//评论变为已读
exports.updateCommentRead = (id)=>{
    const _sql = `UPDATE comment SET isread = 1 WHERE id = ${id};`
    return DB.Mysql.query(_sql)
} 
/**私信接口 */
//获取评论
exports.getMessagePage = (pageSize,nowPage) => {
    const _sql = `SELECT * FROM message ORDER BY id DESC LIMIT ${(nowPage - 1) * pageSize},${pageSize};`
    return DB.Mysql.query(_sql)
}
//获取私信总条数
exports.getMessageCount = ()=>{
    const _sql = `SELECT COUNT(*) AS count FROM message;`
    return DB.Mysql.query(_sql);
}
//私信变为已读
exports.updateMessageRead = (id)=>{
    const _sql = `UPDATE message SET isread = 1 WHERE id = ${id};`
    return DB.Mysql.query(_sql)
}
/**文章接口 */
// 获取文章
exports.getArticlePage = (pageSize,nowPage,state,categoryId,searchTerm) =>{
    if(searchTerm){
        //文章搜索
        const _sql = `SELECT * FROM article WHERE concat(title,introduction) LIKE "%${searchTerm}%" ORDER BY id DESC LIMIT ${(nowPage -1)*pageSize},${pageSize}`
    }else if(categoryId > -1 && state > -1){
        //有状态有分类id
        const _sql = `SELECT * FROM article WHERE category_id = "${categoryId}" AND state = "${state}"  ORDER BY id DESC LIMIT ${(nowPage -1)*pageSize},${pageSize}`
    }else if(categoryId > -1 && state == -1){
        //只有分类id
        const _sql = `SELECT * FROM article WHERE category_id = "${categoryId}"  ORDER BY id DESC LIMIT ${(nowPage -1)*pageSize},${pageSize}`
    }else if(categoryId == -1 && state > -1){
        //只有状态
        const _sql = `SELECT * FROM article WHERE state = "${state}"  ORDER BY id DESC LIMIT ${(nowPage -1)*pageSize},${pageSize}`
    }else{
        //全查
        const _sql = `SELECT * FROM article ORDER BY id DESC LIMIT ${(nowPage -1)*pageSize},${pageSize}`
    }
    return DB.Mysql.query(_sql);
}
//获取文章总条数
exports.getArticleCount = (state,categoryId,searchTerm)=>{
    if(searchTerm){
        //文章搜索
        const _sql = `SELECT COUNT(*) AS count FROM article WHERE concat(title,introduction) LIKE "%${searchTerm}%";`
    }else if(categoryId > -1 && state > -1){
        //有状态有分类id
        const _sql = `SELECT COUNT(*) AS count FROM article WHERE category_id = "${categoryId}" AND state = "${state}";`
    }else if(categoryId > -1 && state == -1){
        //只有分类id
        const _sql = `SELECT COUNT(*) AS count FROM article WHERE category_id = "${categoryId}";`
    }else if(categoryId == -1 && state > -1){
        //只有状态
        const _sql = `SELECT * FROM article WHERE state = "${state}";`
    }else{
        //全查
        const _sql = `SELECT * FROM article;`
    }
    return DB.Mysql.query(_sql);
}   