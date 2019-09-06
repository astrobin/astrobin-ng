import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { Observable, of } from "rxjs";
import { AuthServiceInterface } from "./auth.service.interface";

class AuthServiceMock implements AuthServiceInterface {
    public login(handle: string, password: string): Observable<{ token: string }> {
        if (handle === "ok") {
            return of({token: "1234"});
        }

        return of({token: null});
    }
}

describe("Auth Controller", () => {
    let controller: AuthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [
                AuthController,
            ],
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
        it("should return null token if user does not exist", () => {
            spyOn(controller.authService, "login").and.returnValue(of({ token: null }));
            controller.login({ handle: "missing", password: "foo" }).subscribe(response => {
                expect(response.token).toBeNull();
            });
        });

        it("should return valid token", () => {
            spyOn(controller.authService, "login").and.returnValue(of({ token: "1234" }));
            controller.login({ handle: "ok", password: "foo" }).subscribe(response => {
                expect(response.token).toBe("1234");
            });
        });
    });
});
