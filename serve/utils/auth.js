// [联调新增] 统一从 Authorization 头读取 token，同时兼容旧接口的 body.token。
const jwt = require('./jsonwebtoken');

// 登录鉴权中间件：读取 Bearer token，校验通过后把用户信息放入 req.user
exports.authenticate = (req, res, next) => {
    // 优先读取标准 Bearer 头，旧接口仍兼容 body/query token
    const authorization = req.get('authorization') || '';
    const token = authorization.startsWith('Bearer ')
        ? authorization.slice(7)
        : req.query.token || req.body?.token;

    if (!token) {
        return res.status(401).send({ code: 401, msg: '缺少 token' });
    }

    const payload = jwt.verifyToken(token);
    if (!payload) {
        return res.status(401).send({ code: 401, msg: '登录状态已失效，请重新登录' });
    }
    req.user = payload;
    next();
};
