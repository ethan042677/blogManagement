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
//获取私信
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
exports.getArticlePage = (pageSize,nowPage,state,categoryId,searchTerm,classify) =>{
    if(searchTerm){
        //文章搜索
        const _sql = `SELECT * FROM article WHERE concat(title,introduction) LIKE "%${searchTerm}%" AND classify = "${classify}" ORDER BY id DESC LIMIT ${(nowPage -1)*pageSize},${pageSize}`
    }else if(categoryId > -1 && typeof categoryId == 'number'){
        const _sql = `SELECT * FROM article WHERE category_id = "${categoryId}" AND classify = "${classify}" ORDER BY id DESC LIMIT ${(nowPage -1)*pageSize},${pageSize}`
    }else if(typeof categoryId == 'string'){
        const _sql = `SELECT * FROM article WHERE category_id NOT IN ("${categoryId}") AND classify = "${classify}" ORDER BY id DESC LIMIT ${(nowPage -1)*pageSize},${pageSize}`
    }else if(state > -1){
        const _sql = `SELECT * FROM article WHERE state = "${state}" AND classify = 0 ORDER BY id DESC LIMIT ${(nowPage -1)*pageSize},${pageSize}`
    }else{
        //全查
        const _sql = `SELECT * FROM article WHERE classify = "${classify}" ORDER BY id DESC LIMIT ${(nowPage -1)*pageSize},${pageSize}`
    }
    return DB.Mysql.query(_sql);
}
//获取文章总条数
exports.getArticleCount = (state,categoryId,searchTerm,classify)=>{
    if(searchTerm){
        //文章搜索
        const _sql = `SELECT COUNT(*) AS count FROM article WHERE concat(title,introduction) LIKE "%${searchTerm}%" AND classify = "${classify}";`
    }else if(categoryId > -1 && typeof categoryId == 'number'){
        const _sql = `SELECT COUNT(*) AS count FROM article WHERE category_id = "${categoryId}" AND classify = "${classify}";`
    }else if(typeof categoryId == 'string'){
        const _sql = `SELECT COUNT(*) AS count FROM article WHERE category_id NOT IN ("${categoryId}") AND classify = "${classify}";`
    }else if(state > -1){
        const _sql = `SELECT * FROM article WHERE state = "${state}" AND classify = 0;`
    }else{
        //全查
        const _sql = `SELECT * FROM article WHERE classify = "${classify}";`
    }
    return DB.Mysql.query(_sql);
}   

//发布文章/撤回文章
exports.changeArticleState = (id,state)=>{
    const _sql = `UPDATE article SET state = ${state} WHERE id = ${id};`
    return DB.Mysql.query(_sql)
}
//删除文章
exports.deleteArticle = (id)=>{
    const _sql = `DELETE FROM article WHERE id = ${id};`
    return DB.Mysql.query(_sql)
}

//获取分类
exports.getCategory = (classify)=>{
    const _sql = `SELECT * FROM category WHERE classify = "${classify}";`
    return DB.Mysql.query(_sql)
}

//新建分类
exports.addCategory = (name)=>{
    const _sql = `INSERT INTO category SET ?;`
    return DB.Mysql.query(_sql,name)
}
//修改分类名称
exports.updateCategoryName = (id,name) => {
    const _sql = `UPDATE category SET category_name = "${name}" WHERE id = "${id}"`
    return DB.Mysql.query(_sql)
}
//删除分类
exports.deleteCategory = (id) =>{
    const _sql = `DELETE FROM category WHERE id = "${id}";`
    return DB.Mysql.query(_sql)
}

//获取标签
exports.getLabel = ()=>{
    const _sql = `SELECT * FROM label;`
    return DB.Mysql.query(_sql)
}
//新建标签
exports.addLabel = (name)=>{
    const _sql = `INSERT INTO label SET ?;`
    return DB.Mysql.query(_sql,name)
}
//删除标签
exports.deleteLabel = (id) =>{
    const _sql = `DELETE FROM label WHERE id = "${id}"`
    return DB.Mysql.query(_sql)
}

//获取文件
exports.getFilePage = (pageSize,nowPage,categoryId,) =>{
    if(categoryId > -1 && typeof categoryId == 'number'){
        const _sql = `SELECT * FROM file WHERE category_id = "${categoryId}" ORDER BY id DESC LIMIT ${(nowPage -1)*pageSize},${pageSize}`
    }else if(typeof categoryId == 'string'){
        const _sql = `SELECT * FROM file WHERE category_id NOT IN ("${categoryId}") ORDER BY id DESC LIMIT ${(nowPage -1)*pageSize},${pageSize}`
    }else{
        //全查
        const _sql = `SELECT * FROM file ORDER BY id DESC LIMIT ${(nowPage -1)*pageSize},${pageSize}`
    }
    return DB.Mysql.query(_sql);
}
//获取文件总数
exports.getFileCount = (categoryId)=>{
    if(categoryId > -1 && typeof categoryId == 'number'){
        const _sql = `SELECT COUNT(*) AS count FROM file WHERE category_id = "${categoryId}";`
    }else if(typeof categoryId == 'string'){
        const _sql = `SELECT COUNT(*) AS count FROM file WHERE category_id NOT IN ("${categoryId}");`
    }else{
        //全查
        const _sql = `SELECT COUNT(*) AS count FROM file;`
    }
    return DB.Mysql.query(_sql)
}
//文件移动
exports.moveFile = (id,categoryId) => {
    const _sql = `UPDATE file SET category_id = "${categoryId}" WHERE id = "${id}"`
    return DB.Mysql.query(_sql)
}