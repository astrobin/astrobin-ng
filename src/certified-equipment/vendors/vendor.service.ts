import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Vendor} from "./vendor.entity";
import {Repository} from "typeorm";
import {VendorServiceInterface} from "./vendor.service.interface";

@Injectable()
export class VendorService implements VendorServiceInterface {
    constructor(@InjectRepository(Vendor) private readonly repository: Repository<Vendor>) {
    }

    async search(): Promise<Vendor[]> {
        return await this.repository.find();
    }

    async get(id: string): Promise<Vendor> {
        const result = await this.repository.find({id});
        return result[0];
    }
}
