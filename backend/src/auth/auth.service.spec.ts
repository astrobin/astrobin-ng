import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { JwtServiceMock } from "./jwt.service.mock";
import { HttpService } from "@nestjs/common";
import { HttpServiceMock } from "../mocks/http-service.mock";
import { HttpErrorResponse } from "@angular/common/http";
import { of } from "rxjs";

describe("AuthService", () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: JwtService,
                    useClass: JwtServiceMock,
                },
                {
                    provide: HttpService,
                    useClass: HttpServiceMock,
                },
                AuthService,
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
