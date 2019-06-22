import {Test, TestingModule} from "@nestjs/testing";
import {VendorController} from "./vendor.controller";
import {VendorService} from "./vendor.service";
import {VendorServiceMock} from "./vendor.service.mock";

describe("VendorController", () => {
    let module: TestingModule;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            controllers: [VendorController],
            providers: [
                {
                    provide: VendorService,
                    useClass: VendorServiceMock,
                },
            ],
        }).compile();
    });

    describe("getVendors", () => {
        it("should return some vendor", () => {
            const appController = module.get<VendorController>(VendorController);
            appController.getVendors().then(vendors => {
                expect(vendors.length).toEqual(2);
                expect(vendors[0].name).toEqual("Test Vendor 1");
            });
        });
    });

    describe("getVendor", () => {
        it("should return a vendor by id", () => {
            const appController = module.get<VendorController>(VendorController);
            appController.getVendor({id: "1"}).then(vendor => {
                expect(vendor.name).toEqual("Test Vendor 1");
            });
        });
    });
});
