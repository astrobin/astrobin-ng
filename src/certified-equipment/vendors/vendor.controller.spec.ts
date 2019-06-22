import {Test, TestingModule} from "@nestjs/testing";
import {VendorController} from "./vendor.controller";
import {VendorService} from "./vendor.service";

describe("VendorController", () => {
    let app: TestingModule;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            controllers: [VendorController],
            providers: [VendorService],
        }).compile();
    });

    describe("getHello", () => {
        it("should return 'Hello World!'", () => {
            const appController = app.get<VendorController>(VendorController);
            expect(appController.getHello()).toBe("Hello World!");
        });
    });
});
