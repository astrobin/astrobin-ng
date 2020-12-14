import { TestBed } from "@angular/core/testing";
import { NotificationsApiService } from "./notifications-api.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("NotificationsApiService", () => {
  beforeEach(() => MockBuilder(NotificationsApiService, AppModule));

  it("should be created", () => {
    const service: NotificationsApiService = TestBed.inject(NotificationsApiService);
    expect(service).toBeTruthy();
  });
});
