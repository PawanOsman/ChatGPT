import { RATE_LIMIT, PRIOD, WHITELISTED_IPS } from "./config.js";

const rateLimit = new Map();

function corsMiddleware(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "*");
    next();
};

async function rateLimitMiddleware(req, res, next) {
    let ip = req.headers["CF-Connecting-IP"] ?? req.headers["cf-connecting-ip"] ?? req.headers["X-Forwarded-For"] ?? req.headers["x-forwarded-for"] ?? req.ip;
    if (WHITELISTED_IPS.includes(ip)) return next();
    if (!rateLimit.has(ip)) {
        rateLimit.set(ip, {
            requests: 1,
            lastRequestTime: Date.now()
        });
    } else {
        const currentTime = Date.now();
        const timeSinceLastRequest = currentTime - rateLimit.get(ip).lastRequestTime;
        if (timeSinceLastRequest > PRIOD) {
            rateLimit.set(ip, {
                requests: 1,
                lastRequestTime: currentTime
            });
        } else {
            let updatedCount = rateLimit.get(ip).requests + 1;
            if (updatedCount > RATE_LIMIT) {
                return res.status(429).send({
                    status: false,
                    error: "Too many requests, please try again later"
                });
            }
            rateLimit.set(ip, {
                requests: updatedCount,
                lastRequestTime: rateLimit.get(ip).lastRequestTime
            });
        }
    }

    next();
};

export { corsMiddleware, rateLimitMiddleware }
