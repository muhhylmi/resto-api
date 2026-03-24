import { sign, verify } from "hono/jwt";

const JWT_SECRET = process.env.JWT_SECRET ?? "secret";
const JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN ?? 86400);

export interface JwtPayload {
    sub: number;
    username: string;
    iat: number;
    exp: number;
}

export const signToken = async (userId: string, username: string): Promise<string> => {
    const now = Math.floor(Date.now() / 1000);

    return sign(
        {
            sub: userId,
            username,
            iat: now,
            exp: now + JWT_EXPIRES_IN,
        },
        JWT_SECRET
    );
};

export const verifyToken = async (token: string) => {
    return await verify(token, JWT_SECRET, 'HS256');
};