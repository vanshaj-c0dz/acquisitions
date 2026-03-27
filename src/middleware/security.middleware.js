import aj from '#config/arcjet.js'
import logger from '#config/logger.js'
import { slidingWindow } from '@arcjet/node'

export const securityMiddleware = async (req, res, next) => {
  // 1. BYPASS HEALTH CHECKS
  // This prevents the "BOT requires user-agent" error on internal pings
  if (req.path === '/health') {
    return next();
  }

  try {
    const role = req.user?.role || 'guest'
    let limit;
    let message;

    switch(role) {
      case 'admin':
        limit = 20
        message = 'Admin request limit exceeded {20 per minute}. Slow down'
        break;
      case 'user':
        limit = 10
        message = 'User request limit exceeded {10 per minute}. Slow down' // Fixed typo
        break;
      case 'guest':
      default:
        limit = 5
        message = 'Guest request limit exceeded {5 per minute}. Slow down' // Fixed typo
        break;
    }

    // 2. APPLY RULES
    // We use withRule to add the dynamic rate limit based on role
    const decision = await aj.withRule(
      slidingWindow({
        mode: 'LIVE', 
        interval: '1m', 
        max: limit, 
        name: `${role}-rate-limit`
      })
    ).protect(req);

    // 3. LOGGING & DENIALS
    if (decision.isDenied()) {
      const logContext = { 
        ip: req.ip, 
        userAgent: req.get('User-Agent'), 
        path: req.path 
      };

      if (decision.reason.isBot()) {
        logger.warn('Bot request blocked', logContext);
        return res.status(403).json({ error: 'Forbidden', message: 'Automated requests are not allowed' });
      }
      
      if (decision.reason.isShield()) {
        logger.warn('Shield request blocked', { ...logContext, method: req.method });
        return res.status(403).json({ error: 'Forbidden', message: 'Request blocked by security policy' });
      }
      
      if (decision.reason.isRateLimit()) {
        logger.warn('Rate limit exceeded', logContext);
        // Using 429 is more standard for rate limits than 403
        return res.status(429).json({ error: 'Too Many Requests', message });
      }
    }

    next();
  } catch (e) {
    logger.error('Arcjet middleware error: ', e);
    res.status(500).json({ error: 'Internal server error', message: 'Security check failed' });
  }
}