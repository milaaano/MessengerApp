import jwt from 'jsonwebtoken';

export const setCookie = (res, name, value, { maxAge, httpOnly = true, secure = true, sameSite = 'strict', path = '/', domain } = {}) => {
  const parts = [`${name}=${value}`];
  if (maxAge) parts.push(`Max-Age=${maxAge}`);
  if (path) parts.push(`Path=${path}`);
  if (domain) parts.push(`Domain=${domain}`);
  if (httpOnly) parts.push(`HttpOnly`);
  if (secure) parts.push(`Secure`);
  if (sameSite) parts.push(`SameSite=${sameSite}`);
  res.setHeader('Set-Cookie', parts.join('; '));
};

export const generateToken = (userId, res) => {
    const token = jwt.sign(
        { userId },
        process.env.JWT_SECRET, 
        { expiresIn: "1d" }
    );

    setCookie(res, "jwt", token, {
        maxAge: 3600 * 24,
        secure: process.env.NODE_ENV !== "dev",
    });

    return token;
};

export const parseCookies = (cookieHeader) => {
    const cookies = {};

    if (!cookieHeader) return cookies;

    const parts = cookieHeader.split(';').map( item => item.trim());
    
    parts.forEach(item => {
        const [key, val] = item.split('=');
        cookies[key] = val;
    });

    return cookies;
};

export const parseJSONBody = async (req) => {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            if (!body) {
                resolve({});
            }
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject(new Error("Invalid JSON"));
            }
        });

        req.on('error', (err) => {
            reject(err);
        });


    });
};

export const runHandler = (handlers, req, res) => {
    let idx = -1;

    const handleError = (err) => {
        if (res.writableEnded) return;
        console.error("Error in some handler: ", err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal server error' }));
    };

    const next = (err) => {
        if (err) return handleError(err);
        if (res.writableEnded) return;

        idx++;
        if (idx >= handlers.length) return;

        const fn = handlers[idx];
        if (!fn) return;

        try {
            const result = fn(req, res, next);
            if (result && typeof result.then === 'function') {
                result.catch(handleError);
            }
        } catch (e) {
            handleError(e);
        }
    };

    next();
};