import { TestBed } from "@angular/core/testing";
import { NotificationsService } from "@features/notifications/notifications.service";

describe("NotificationsService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: NotificationsService = TestBed.inject(NotificationsService);
    expect(service).toBeTruthy();
  });
});
