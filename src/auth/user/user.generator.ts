import * as faker from "faker";
import {User} from "./user.entity";

export class UserGenerator {
    static generate(): User {
        return {
            id: faker.random.uuid(),
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
        } as User;
    }
}
