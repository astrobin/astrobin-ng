import {Test, TestingModule} from "@nestjs/testing";
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {AuthServiceMock} from "./auth.service.mock";
import {UserGenerator} from "../user/user.generator";
import {User} from "../user/user.entity";
import {HttpStatus} from "@nestjs/common";

describe("Auth Controller", () => {
    let controller: AuthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useClass: AuthServiceMock,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("login", () => {
        it("should return NOT_FOUND if user does not exist", async () => {
            const result = await controller.login(null);
            expect(result).toEqual({status: HttpStatus.NOT_FOUND});
        });

        it("should return the very same user", async () => {
            const user: User = UserGenerator.generate();

            const result = await controller.login(user);
            expect(result).toEqual(user);
        });
    });

    describe("register", () => {
        it("should return the very same user", async () => {
            const user: User = UserGenerator.generate();
            const result = await controller.register(user);
            expect(result).toEqual(user);
        });
    });
});
