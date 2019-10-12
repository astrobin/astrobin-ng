import { Test, TestingModule } from "@nestjs/testing";
import { ErrorsInterceptor } from "./errors.interceptor";
import { ExecutionContext } from "@nestjs/common";
import { of, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

describe("ErrorInterceptor", () => {
    let module: TestingModule;
    let interceptor: ErrorsInterceptor;

    const executionContext: ExecutionContext = {
        switchToHttp: jest.fn().mockReturnThis(),
        getClass: jest.fn().mockReturnThis(),
        getHandler: jest.fn().mockReturnThis(),
        getArgs: jest.fn().mockReturnThis(),
        getArgByIndex: jest.fn().mockReturnThis(),
        switchToRpc: jest.fn().mockReturnThis(),
        switchToWs: jest.fn().mockReturnThis(),
    };

    const callHandler = {
        handle: jest.fn().mockImplementationOnce(() => throwError({code: "Some error"})),
    };

    beforeAll(async () => {
        module = await Test.createTestingModule({}).compile();
        interceptor = new ErrorsInterceptor();
    });

    it("should compile", () => {
        expect(interceptor).toBeDefined();
    });

    describe("intercept", () => {
        it("should throw 500 for errors", (done) => {
            const actualValue = interceptor.intercept(executionContext, callHandler);
            actualValue.pipe(
                catchError(error => {
                    expect(error.status).toEqual(500);
                    return of(done());
                }),
            ).subscribe();
            expect(callHandler.handle).toBeCalledTimes(1);
        });

        it("should throw 400 for errors about db constraint violations", (done) => {
            callHandler.handle = jest.fn().mockImplementationOnce(() => throwError({code: "CONSTRAINT"}));
            const actualValue = interceptor.intercept(executionContext, callHandler);
            actualValue.pipe(
                catchError(error => {
                    expect(error.status).toEqual(400);
                    return of(done());
                }),
            ).subscribe();
            expect(callHandler.handle).toBeCalledTimes(1);
        });
    });
});
