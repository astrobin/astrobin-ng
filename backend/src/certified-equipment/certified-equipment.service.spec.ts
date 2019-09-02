import {Test, TestingModule} from "@nestjs/testing";
import {CertifiedEquipmentService} from "./certified-equipment.service";
import {ConfigService} from "../config.service";
import {ConfigServiceMock} from "../config.service.mock";

describe("CertifiedEquipmentService", () => {
    let module: TestingModule;
    let service: CertifiedEquipmentService;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                CertifiedEquipmentService,
                {
                    provide: ConfigService,
                    useValue: new ConfigServiceMock(),
                },
            ],
        }).compile();
        service = module.get<CertifiedEquipmentService>(CertifiedEquipmentService);
    });

    it("should compile", () => {
        expect(service).toBeDefined();
    });
});
