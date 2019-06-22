import {User} from "../user/user.entity";

export interface AuthServiceInterface {
    login(user: User): Promise<User | { status: number }>;

    register(user: User): Promise<User>;
}
