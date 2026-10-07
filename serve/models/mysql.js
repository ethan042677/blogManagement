const mysql = require('mysql2/promise');
const config = require('../config/default');

//创建数据库
const blog_base = `CREATE DATABASE IF NOT EXISTS blog_base
                    CHARACTER SET utf8mb4
                    COLLATE utf8mb4_general_ci;`;
// 建库：用不绑定 database 的独立连接，建完就关(直接连接)
const createDataBase = async (sql) => {
    const connection = await mysql.createConnection({
        host: config.database.HOST,
        user: config.database.USER,
        password: config.database.PASSWORD,
        port:config.database.PORT
        // 不指定 database
    });
    try {
        const [result] = await connection.query(sql);
        return result;
    } finally {
        await connection.end();
    }
};

/**创建一个数据库连接池 */
const pool = mysql.createPool({
    connectionLimit: 10, //最大连接数，默认为10
    host:config.database.HOST,
    user:config.database.USER,
    password:config.database.PASSWORD,
    database:config.database.DATABASE,
    port:config.database.PORT
})

class Mysql {
    constructor() {}
    async query(sql, params) {
        const connection = await pool.getConnection();
        try {
            const [results] = await connection.query(sql, params);
            return results;
        } finally {
            connection.release();
        }
    }
}

module.exports = {
    Mysql:new Mysql(),
    createDataBase
};

