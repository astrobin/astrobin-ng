import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./user.entity";
import {Repository} from "typeorm";
import {AuthUtils} from "../auth/auth-utils";

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private repository: Repository<User>) {
    }

    async findByEmail(email: string): Promise<User> {
        return await this.repository.findOne({
            where: {
                email,
            },
        });
    }

    async findById(id: string): Promise<User> {
        return await this.repository.findOne({
            where: {
                id,
            },
        });
    }

    async create(userData: User): Promise<User> {
        userData.password = AuthUtils.hashPassword(userData.password);
        return await this.repository.save(userData);
    }
}
