import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { JwtServiceMock } from "./jwt.service.mock";
import { AuthApiService } from "./auth-api.servicee";
import { Observable, of, throwError } from "rxjs";

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
                    provide: AuthApiService,
                    useValue: {
                        login: jest.fn(),
                    },
                },
                AuthService,
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("login", () => {
        it("should login against legacy backend", () => {
            spyOn(service.authApi, "login").and.returnValue(of({
                data: [
                    {
                        id: 1,
                    },
                ],
            }));

            service.login("handle", "password").subscribe(response => {
                expect(response.token).not.toBeNull();
                expect(response.user_profile_id).toEqual(1);
            });
        });

        it("should return null token on error", () => {
            spyOn(service.authApi, "login").and.returnValue(throwError("Error"));

            service.login("handle", "password").subscribe(response => {
                expect(response.token).toBeNull();
                expect(response.user_profile_id).toBeNull();
            });
        });
    });
});
