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
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    });

    setCookie(res, "jwt", token, {
        maxAge: 3600 * 24,
        secure: process.env.NODE_ENV !== "dev",
    });

    return token;
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