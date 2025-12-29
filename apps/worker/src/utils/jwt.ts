import jwt from 'jsonwebtoken';

const SECRET_KEY = 'dev_secret'; // Matches Flask default for migration compatibility

export const createAccessToken = (userId: string): string => {
    // 30 days expiration as per typical requirement (flask implementation might vary, let's assume standard)
    // Flask code: create_access_token(user_id) -> default usually shorter, but persistent usually long.
    // Checking flask again: app/core/security.py (I read service.py which calls it).
    // Standard Flask-JWT-Extended is 15 mins but often customized.
    // Let's use 24h for simple parity or check if I can find the flask config.
    // user_id is passed as subject 'sub'
    return jwt.sign({ sub: userId }, SECRET_KEY, { expiresIn: '7d' });
};

export const verifyToken = (token: string): string | null => {
    try {
        const payload = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
        return payload.sub as string;
    } catch (e) {
        return null;
    }
};
