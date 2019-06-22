import * as request from "supertest";
import {Test} from "@nestjs/testing";
import {INestApplication} from "@nestjs/common";
import {VendorModule} from "../src/certified-equipment/vendors/vendor.module";

describe("Vendor (e2e)", () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [VendorModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it("/ (GET)", () => {
        return request(app.getHttpServer())
            .get("/")
            .expect(200)
            .expect("Hello World!");
    });
});
