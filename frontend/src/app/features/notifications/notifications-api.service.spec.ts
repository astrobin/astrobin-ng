import { TestBed } from "@angular/core/testing";

import { NotificationsApiService } from "./notifications-api.service";

describe("NotificationsApiService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: NotificationsApiService = TestBed.get(NotificationsApiService);
    expect(service).toBeTruthy();
  });
});
