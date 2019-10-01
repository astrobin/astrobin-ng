import { Test, TestingModule } from "@nestjs/testing";
import { VendorUtilsController } from "./vendor-utils.controller";
import { VendorService } from "../vendor.service";

describe("VendorUtils Controller", () => {
    let controller: VendorUtilsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: VendorService,
                    useValue: { findSimilar: jest.fn() },
                },
            ],
            controllers: [VendorUtilsController],
        }).compile();

        controller = module.get<VendorUtilsController>(VendorUtilsController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
