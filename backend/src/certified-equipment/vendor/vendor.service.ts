import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Vendor } from "./vendor.entity";
import { Repository } from "typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";

@Injectable()
export class VendorService extends TypeOrmCrudService<Vendor> {
    constructor(@InjectRepository(Vendor) private readonly repository: Repository<Vendor>) {
        super(repository);
    }
}
