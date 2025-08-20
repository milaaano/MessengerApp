import jwt from 'jsonwebtoken';

// adds Set-header: set-cookie to the response
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

// generates JWT token, bound to the userId
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

// accepts cookie heare value (string) and returns an object {cookie_name: cookie: value}
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

// parses JSON body, chunk by chunk
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

// accepts an array of handlers; executes endpoints' handlers; contains fucntion next(), which executes next handler
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

// accepts url and optional pattern (for example: /api/message/:id) to match url; returns JSON object (for {pathname: /api/message/:id, parts: ["api", "message", "52"], query_string: {param1: value1, ...}, params: { id: 52 }})
export const parseURL = (url, pattern = "") => {
    const pattern_parts = pattern.split("/").filter(Boolean);

    const full_url = new URL(url, `${process.env.NODE_ENV !== "dev" ? 'https' : 'http'}://localhost:${process.env.PORT}`);
    
    const parsed = {
        pathname: full_url.pathname,
        parts: full_url.pathname.split('/').filter(Boolean),
        query_string: Object.fromEntries(full_url.searchParams),
        params: {}
    }

    if (pattern_parts.length !== parsed.parts.length) return null;

    for (let i = 0; i < pattern_parts.length; i++) {
        const pattern_part = pattern_parts[i];
        const url_part = parsed.parts[i];

        if (pattern_part.startsWith(':')) {
            parsed.params[pattern_part.slice(1)] = decodeURIComponent(url_part);
        } else {
            if (pattern_part !== url_part) return null;
        }
    }

    return parsed;
};

// accepts url and routes object, which contains all the routes in API. Return methods object and parsed url object if a match found, else returns null
export const findMatchURL = (url, routes) => {
    let parsed;
    for (const path of Object.keys(routes)) {
        parsed = parseURL(url, path);
        if (parsed) {
            return { route: routes[path], parsed };
        }
    }

    return null;
};