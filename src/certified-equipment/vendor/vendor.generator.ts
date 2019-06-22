import * as faker from "faker";
import {Vendor} from "./vendor.entity";

export class VendorGenerator {
    static generate(): Vendor {
        return {
            id: faker.random.uuid(),
            name: faker.name.findName(),
            description: faker.lorem.sentence(),
        } as Vendor;
    }
}
