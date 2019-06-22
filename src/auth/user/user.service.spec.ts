import {Test, TestingModule} from "@nestjs/testing";
import {UserService} from "./user.service";
import {UserGenerator} from "./user.generator";

export class UserRepositoryMock {
    // tslint:disable-next-line:no-empty
    public findOne() {
    }

    // tslint:disable-next-line:no-empty
    public save() {
    }
}

describe("UserService", () => {
    let service: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: "UserRepository",
                    useClass: UserRepositoryMock,
                },
                UserService,
            ],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("findByEmail", () => {
        it("should find a user", () => {
            const user = UserGenerator.generate();
            jest.spyOn((service as any).repository, "findOne").mockReturnValue(user);
            service.findByEmail(user.email).then(result => {
                expect(result).toEqual(user);
            });
        });
    });

    describe("findById", () => {
        it("should find a user", () => {
            const user = UserGenerator.generate();
            jest.spyOn((service as any).repository, "findOne").mockReturnValue(user);
            service.findById(user.id).then(result => {
                expect(result).toEqual(user);
            });
        });
    });

    describe("create", () => {
        it("should return the created user", () => {
            const user = UserGenerator.generate();
            jest.spyOn((service as any).repository, "save").mockReturnValue(user);
            service.create(user).then(result => {
                expect(result).toEqual(user);
            });
        });
    });
});
