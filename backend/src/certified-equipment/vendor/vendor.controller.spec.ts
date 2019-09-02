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

    it("should compile", () => {
        const controller = module.get<VendorController>(VendorController);
        expect(controller).toBeDefined();
    });
});
