import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { NotificationsApiService } from "./notifications-api.service";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("NotificationsApiService", () => {
  beforeEach(() => MockBuilder(NotificationsApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule));

  it("should be created", () => {
    const service: NotificationsApiService = TestBed.inject(NotificationsApiService);
    expect(service).toBeTruthy();
  });
});
