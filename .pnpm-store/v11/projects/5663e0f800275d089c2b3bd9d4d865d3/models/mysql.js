// [联调改造] 保留旧导入路径作为兼容层，实际连接池由 Sequelize 管理。
const { sequelize } = require('./sequelize');

exports.Mysql = {
    sequelize,
};

