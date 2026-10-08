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