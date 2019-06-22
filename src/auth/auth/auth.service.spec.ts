import {Test, TestingModule} from "@nestjs/testing";
import {AuthService} from "./auth.service";
import {JwtService} from "@nestjs/jwt";
import {JwtServiceMock} from "./jwt.service.mock";
import {UserService} from "../user/user.service";
import {UserRepositoryMock} from "../user/user.service.spec";
import {UserGenerator} from "../user/user.generator";

describe("AuthService", () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                UserService,
                {
                    provide: JwtService,
                    useClass: JwtServiceMock,
                },
                {
                    provide: "UserRepository",
                    useClass: UserRepositoryMock,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("login", () => {
        it("should resolve to 404 if the user does not exist", async () => {
            jest.spyOn((service as any).userService, "findByEmail").mockReturnValue(null);
            const result = await service.login(UserGenerator.generate());
            expect(result).toEqual({status: 404});
        });

        it("should be ok", async () => {
            const user = UserGenerator.generate();
            jest.spyOn((service as any).userService, "findByEmail").mockReturnValue(user);
            const result = await service.login(user);
            expect(result).toEqual({
                access_token: undefined,
                expires_in: 3600,
                status: 200,
                user_id: user.id,
            });
        });
    });

    describe("register", () => {
        it("should be ok", async () => {
            const user = UserGenerator.generate();
            jest.spyOn((service as any).userService, "create").mockReturnValue(user);
            const result = await service.register(user);
            expect(result).toEqual(user);
        });
    });
});
