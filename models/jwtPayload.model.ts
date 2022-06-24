export default interface jwtPayload {
    id: string;
    name: string;
    username: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
