"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalApiKey = exports.requireApiKey = void 0;
const database_1 = require("../utils/database");
const requireApiKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: 'API key is required'
        });
    }
    try {
        // Check against database
        const db = (0, database_1.getDatabase)();
        const result = db.prepare('SELECT * FROM api_keys WHERE key_hash = ? AND is_active = 1').get(apiKey);
        if (!result) {
            return res.status(403).json({
                success: false,
                message: 'Invalid API key'
            });
        }
        // Update last used timestamp
        db.prepare('UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?').run(result.id);
        // Add user info to request
        req.user = {
            id: 'api-user',
            apiKey: apiKey
        };
        next();
    }
    catch (error) {
        console.error('API key validation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.requireApiKey = requireApiKey;
const optionalApiKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
        try {
            const db = (0, database_1.getDatabase)();
            const result = db.prepare('SELECT * FROM api_keys WHERE key_hash = ? AND is_active = 1').get(apiKey);
            if (result) {
                // Update last used timestamp
                db.prepare('UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?').run(result.id);
                req.user = {
                    id: 'api-user',
                    apiKey: apiKey
                };
            }
        }
        catch (error) {
            console.error('Optional API key validation error:', error);
            // Don't fail the request for optional API key validation errors
        }
    }
    next();
};
exports.optionalApiKey = optionalApiKey;
//# sourceMappingURL=auth.js.map