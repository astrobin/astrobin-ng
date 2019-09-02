import {AuthServiceInterface} from "./auth.service.interface";
import {User} from "../user/user.entity";
import {HttpStatus} from "@nestjs/common";

export class AuthServiceMock implements AuthServiceInterface {
    public login(user: User): Promise<User | { status: number }> {
        return new Promise<User | { status: number }>(resolve => {
            if (!user) {
                resolve({status: HttpStatus.NOT_FOUND});
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
