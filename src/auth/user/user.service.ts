import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./user.entity";
import {Repository} from "typeorm";

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

    async create(user: User): Promise<User> {
        return await this.repository.save(user);
    }
}
