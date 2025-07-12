import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../utils/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    apiKey: string;
  };
}

export const requireApiKey = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key is required'
    });
  }

  try {
    // Check against database
    const db = await getDatabase();
    const result = await db.get(
      'SELECT * FROM api_keys WHERE key_hash = ? AND is_active = 1',
      [apiKey]
    );
    
    if (!result) {
      return res.status(403).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    // Update last used timestamp
    await db.run(
      'UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?',
      [result.id]
    );

    // Add user info to request
    req.user = {
      id: 'api-user',
      apiKey: apiKey
    };

    next();
  } catch (error) {
    console.error('API key validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const optionalApiKey = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (apiKey) {
    try {
      const db = await getDatabase();
      const result = await db.get(
        'SELECT * FROM api_keys WHERE key_hash = ? AND is_active = 1',
        [apiKey]
      );
      
      if (result) {
        // Update last used timestamp
        await db.run(
          'UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?',
          [result.id]
        );

        req.user = {
          id: 'api-user',
          apiKey: apiKey
        };
      }
    } catch (error) {
      console.error('Optional API key validation error:', error);
      // Don't fail the request for optional API key validation errors
    }
  }

  next();
}; 