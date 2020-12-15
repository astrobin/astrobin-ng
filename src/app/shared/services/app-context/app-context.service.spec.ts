import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { AppContextService } from "./app-context.service";

describe("AppContextService", () => {
  let service: AppContextService;

  beforeEach(async () => {
    await MockBuilder(AppContextService, AppModule);
    service = TestBed.inject(AppContextService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("currentUserProfile should be available", () => {
    service.loadForUser().then((contextService: AppContextService) => {
      contextService.context$.subscribe(appContext => {
        expect(appContext.currentUserProfile.id).toEqual(1);
      });
    });
  });

  it("currentUser should be available", () => {
    service.loadForUser().then((contextService: AppContextService) => {
      contextService.context$.subscribe(appContext => {
        expect(appContext.currentUser.id).toEqual(1);
      });
    });
  });
});
