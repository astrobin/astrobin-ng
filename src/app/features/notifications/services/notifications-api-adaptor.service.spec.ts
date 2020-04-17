import { TestBed } from "@angular/core/testing";
import {
  BackendNotificationInterface,
  NotificationsApiAdaptorService
} from "@features/notifications/services/notifications-api-adaptor.service";
import { NotificationInterface } from "@features/notifications/interfaces/notification.interface";

describe("NotificationsApiAdaptorService", () => {
  let service: NotificationsApiAdaptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationsApiAdaptorService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("notificationFromBackend", () => {
    it("should convert correctly", () => {
      const backendNotification: BackendNotificationInterface = {
        id: 1,
        user: 1,
        from_user: 2,
        subject: "Foo",
        message: "Bar",
        level: 10,
        extra_tags: "tags",
        created: "2010-01-01",
        modified: "2010-01-02",
        read: false,
        expires: "2010-01-03",
        close_timeout: 300
      };

      expect(service.notificationFromBackend(backendNotification)).toEqual({
        id: 1,
        user: 1,
        fromUser: 2,
        subject: "Foo",
        message: "Bar",
        level: 10,
        extraTags: "tags",
        created: new Date("2010-01-01"),
        modified: new Date("2010-01-02"),
        read: false,
        expires: new Date("2010-01-03"),
        closeTimeout: 300
      });
    });
  });

  describe("notificationToBackend", () => {
    it("should convert correctly", () => {
      const notification: NotificationInterface = {
        id: 1,
        user: 1,
        fromUser: 2,
        subject: "Foo",
        message: "Bar",
        level: 10,
        extraTags: "tags",
        created: new Date("2010-01-01"),
        modified: new Date("2010-01-02"),
        read: false,
        expires: new Date("2010-01-03"),
        closeTimeout: 300
      };

      expect(service.notificationToBackend(notification)).toEqual({
        id: 1,
        user: 1,
        from_user: 2,
        subject: "Foo",
        message: "Bar",
        level: 10,
        extra_tags: "tags",
        created: "2010-01-01T00:00:00.000Z",
        modified: "2010-01-02T00:00:00.000Z",
        read: false,
        expires: "2010-01-03T00:00:00.000Z",
        close_timeout: 300
      });
    });
  });
});
