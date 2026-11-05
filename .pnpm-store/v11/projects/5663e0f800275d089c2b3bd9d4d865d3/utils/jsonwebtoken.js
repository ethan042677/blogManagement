// [联调修复] 原 verifyToken 在异步回调外立即返回值，导致校验结果始终是 undefined。
const jwt = require('jsonwebtoken');
const config = require('../config/default');

// 生成 JWT：默认有效期 30 天
exports.generateToken = (name) => jwt.sign(
    { name },
    config.jwtSecret,
    { expiresIn: '30d' },
);

// 校验 JWT：成功返回用户信息，失败返回 null
exports.verifyToken = (token) => {
    try {
        //把token和config.jwtSecret中的做对比
        return jwt.verify(token, config.jwtSecret);
    } catch (error) {
        console.error('无效的令牌：', error.message);
        return null;
    }
};
