import { TestBed } from "@angular/core/testing";

import { PopNotificationsService } from "./pop-notifications.service";

describe("PopNotificationsService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: PopNotificationsService = TestBed.get(PopNotificationsService);
    expect(service).toBeTruthy();
  });
});
