import {Test, TestingModule} from "@nestjs/testing";
import {VendorService} from "./vendor.service";

class VendorRepositoryMock {
    public find() {
    }
}

describe("VendorService", () => {
    let module: TestingModule;
    let service: VendorService;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                {
                    provide: "VendorRepository",
                    useClass: VendorRepositoryMock,
                },
                VendorService,
            ],
        }).compile();
        service = module.get<VendorService>(VendorService);
    });

    describe("search", () => {
        it("should call find on the repository", () => {
            jest.spyOn((service as any).repository, "find");
            service.search().then(() => {
                expect((service as any).repository.find).toHaveBeenCalled();
            });
        });
    });

    describe("get", () => {
        it("should call find on the repository", () => {
            jest.spyOn((service as any).repository, "find");
            service.get("1").then(() => {
                expect((service as any).repository.find).toHaveBeenCalled();
            });
        });
    });
});
