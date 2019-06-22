import {AuthServiceInterface} from "./auth.service.interface";
import {User} from "../user/user.entity";

export class AuthServiceMock implements AuthServiceInterface {
    public login(user: User): Promise<User | { status: number }> {
        return new Promise<User|{status: number}>(resolve => {
            if (!user) {
                resolve({status: 404});
                return;
            }

            resolve(user);
        });

    }

    public register(user: User): Promise<User> {
        return new Promise<User>(resolve => {
            resolve(user);
        });
    }
}
