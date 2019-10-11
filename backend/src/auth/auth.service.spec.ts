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

    it("should have error message in case of error", () => {
        const errorResponse = new HttpErrorResponse({
            error: "Serious error",
            status: 500,
            statusText: "This should not have happened",
        });

        spyOn(service.http, "post").and.returnValue(of(errorResponse));
        service.login("handle", "password").subscribe(token => {
            expect(token.token).toBeNull();
            expect(token.user_profile_id).toBeNull();
            expect(token.error).toEqual("Serious error");
        });
    });
});
