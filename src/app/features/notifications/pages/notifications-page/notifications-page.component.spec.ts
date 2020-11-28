import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { NotificationInterfaceGenerator } from "@features/notifications/generators/notification.interface.generator";
import { NormalizeNotificationLinkPipe } from "@features/notifications/pipes/normalize-notification-link.pipe";
import { NotificationServiceMock } from "@features/notifications/services/notification.service-mock";
import { NotificationsService } from "@features/notifications/services/notifications.service";
import { EmptyListComponent } from "@shared/components/misc/empty-list/empty-list.component";
import { MockComponents, MockPipe } from "ng-mocks";
import { TimeagoPipe } from "ngx-timeago";
import { NotificationsPageComponent } from "./notifications-page.component";

describe("NotificationsPageComponent", () => {
  let component: NotificationsPageComponent;
  let fixture: ComponentFixture<NotificationsPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [testAppImports],
      declarations: [
        NotificationsPageComponent,
        MockComponents(EmptyListComponent),
        MockPipe(NormalizeNotificationLinkPipe),
        MockPipe(TimeagoPipe)
      ],
      providers: [
        {
          provide: NotificationsService,
          useClass: NotificationServiceMock
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("toggleRead", () => {
    it("should call the right service method", () => {
      const notification = NotificationInterfaceGenerator.notification();
      notification.read = true;

      component.toggleRead(notification);

      expect(component.notificationsService.markAsUnread).toHaveBeenCalledWith(notification);

      notification.read = false;
      component.toggleRead(notification);

      expect(component.notificationsService.markAsRead).toHaveBeenCalledWith(notification);
    });
  });

  describe("markAllAsRead", () => {
    it("should call the service method", () => {
      component.markAllAsRead();

      expect(component.notificationsService.markAllAsRead).toHaveBeenCalled();
    });
  });

  describe("pageChange", () => {
    it("should get notification for that page from the service", () => {
      component.pageChange(2);

      expect(component.notificationsService.getAll).toHaveBeenCalledWith(2);
    });
  });
});
