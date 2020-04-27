import { TestBed } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { NotificationsApiService } from "./notifications-api.service";

describe("NotificationsApiService", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [testAppImports]
    })
  );

  it("should be created", () => {
    const service: NotificationsApiService = TestBed.inject(NotificationsApiService);
    expect(service).toBeTruthy();
  });
});
