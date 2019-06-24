import * as faker from "faker";
import {User} from "./user.entity";
import {AuthUtils} from "../auth/auth-utils";

export class UserGenerator {
    static generate(): User {
        return {
            id: faker.random.uuid(),
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: AuthUtils.hashPassword(faker.internet.password()),
        } as User;
    }
}
