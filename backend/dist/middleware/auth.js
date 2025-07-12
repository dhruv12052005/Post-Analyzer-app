"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalApiKey = exports.requireApiKey = void 0;
const requireApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: 'API key is required'
        });
    }
    // In a real application, you would validate against a database
    // For now, we'll use an environment variable
    const validApiKey = process.env.API_KEY;
    if (!validApiKey || apiKey !== validApiKey) {
        return res.status(403).json({
            success: false,
            message: 'Invalid API key'
        });
    }
    // Add user info to request
    req.user = {
        id: 'api-user',
        apiKey: apiKey
    };
    next();
};
exports.requireApiKey = requireApiKey;
const optionalApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
        const validApiKey = process.env.API_KEY;
        if (validApiKey && apiKey === validApiKey) {
            req.user = {
                id: 'api-user',
                apiKey: apiKey
            };
        }
    }
    next();
};
exports.optionalApiKey = optionalApiKey;
//# sourceMappingURL=auth.js.map