export default interface User {
    id: string;
    name?: string;
    email?: string;
    twitterHandle?: string;
    imageUrl?: string;
    loggedIn: boolean;
}
