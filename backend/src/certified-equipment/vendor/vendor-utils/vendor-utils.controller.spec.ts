import { Test, TestingModule } from "@nestjs/testing";
import { VendorUtilsController } from "./vendor-utils.controller";

describe("VendorUtils Controller", () => {
    let controller: VendorUtilsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [VendorUtilsController],
        }).compile();

        controller = module.get<VendorUtilsController>(VendorUtilsController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
