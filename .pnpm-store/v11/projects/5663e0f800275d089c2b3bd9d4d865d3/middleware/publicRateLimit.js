// 前台匿名评论限流：仅在进程内保存短期时间窗口，不持久化 IP 或访客身份。
const buckets = new Map();

// 每次请求时顺带删除过期窗口，避免长期运行时 Map 持续增长。
const cleanup = (now) => {
    for (const [key, bucket] of buckets.entries()) {
        if (bucket.resetAt <= now) buckets.delete(key);
    }
};

// 工厂函数允许不同接口独立设置窗口和上限，后续可以复用于点赞等场景。
exports.createRateLimiter = ({ windowMs, max, name = 'request' }) => (req, res, next) => {
    const now = Date.now();
    cleanup(now);
    const key = `${name}:${req.ip}`;
    const current = buckets.get(key);
    // 首次请求或原窗口已过期时创建新的固定窗口。
    const bucket = !current || current.resetAt <= now
        ? { count: 0, resetAt: now + windowMs }
        : current;

    if (bucket.count >= max) {
        // 429 响应同时携带标准限流头，便于前端或代理层判断重试时间。
        const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
        res.set({
            'Retry-After': String(retryAfter),
            'RateLimit-Limit': String(max),
            'RateLimit-Remaining': '0',
            'RateLimit-Reset': String(Math.ceil(bucket.resetAt / 1000)),
        });
        return res.status(429).send({
            code: 429,
            msg: '本小时评论次数已达上限，请稍后再试',
        });
    }

    bucket.count += 1;
    buckets.set(key, bucket);
    res.locals.rateLimitRemaining = Math.max(0, max - bucket.count);
    res.set({
        'RateLimit-Limit': String(max),
        'RateLimit-Remaining': String(res.locals.rateLimitRemaining),
        'RateLimit-Reset': String(Math.ceil(bucket.resetAt / 1000)),
    });
    return next();
};
