import { Test, TestingModule } from "@nestjs/testing";
import { AuthApiService } from "./auth-api.servicee";
import { HttpService } from "@nestjs/common";
import { HttpServiceMock } from "../mocks/http-service.mock";
import { of } from "rxjs";

describe("AuthApiService", () => {
    let service: AuthApiService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: HttpService,
                    useClass: HttpServiceMock,
                },
                AuthApiService,
            ],
        }).compile();

        service = module.get(AuthApiService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should login", () => {
        const result = {
            data: {
                token: "1234",
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config: {},
        };

        jest.spyOn(service.http, "post").mockReturnValue(of(result));
        jest.spyOn(service, "getUserProfile").mockReturnValue(of({id: 1}));

        service.login("handle", "password").subscribe(response => {
            expect(service.http.post).toHaveBeenCalledWith(
                "http://localhost:8084/api/v2/api-auth-token/",
                {username: "handle", password: "password"});
            expect(service.getUserProfile).toHaveBeenCalledTimes(1);
            expect(response.id).toEqual(1);
        });
    });

    it("should get user profile", () => {
        const result = {
            data: {
                id: 1,
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config: {},
        };

        jest.spyOn(service.http, "get").mockReturnValue(of(result));

        service.getUserProfile(null).subscribe(response => {
            expect(response.data.id).toEqual(1);
        });
    });
});
