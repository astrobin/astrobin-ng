import * as faker from "faker";
import { VendorInterface } from "../interfaces/equipment/vendor.interface";
import { ModerationStatus } from "../enums/moderation-status.enum";

export class VendorGenerator {
    private static vendor(): VendorInterface {
        return {
            id: faker.random.uuid(),
            name: faker.name.findName(),
            website: faker.internet.url(),
            description: faker.lorem.sentence(),
            logo: faker.internet.url(),
            createdBy: faker.random.uuid(),
            createdWhen: faker.date.past().getTime(),
            updatedBy: faker.random.uuid(),
            updatedWhen: faker.date.past().getTime(),
            updateReason: faker.lorem.sentence(),
            moderatedBy: faker.random.uuid(),
            moderatedWhen: faker.date.past().getTime(),
            moderationStatus: faker.random.arrayElement(Object.getOwnPropertyNames(ModerationStatus)),
        };
    }

    public static generate(): VendorInterface {
        return this.vendor();
    }

    public static generateMany(amount: number): VendorInterface[] {
        return Array.from(Array(amount).keys()).map(x => this.vendor());
    }
}
