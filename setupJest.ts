import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

import "@angular/localize/init";

import { FormGroup } from "@angular/forms";
import { NotificationListResponseInterfaceGenerator } from "@features/notifications/generators/notification-list-response.interface.generator";
import { NotificationsApiService } from "@features/notifications/services/notifications-api.service";
import { SubscriptionsService } from "@features/subscriptions/services/subscriptions.service";
import { TranslateService } from "@ngx-translate/core";
import { LoginFormComponent } from "@shared/components/auth/login-form/login-form.component";
import { UsernameService } from "@shared/components/misc/username/username.service";
import { UserProfileGenerator } from "@shared/generators/user-profile.generator";
import { UserGenerator } from "@shared/generators/user.generator";
import { UserInterface } from "@core/interfaces/user.interface";
import { CommonApiService } from "@core/services/api/classic/common/common-api.service";
import { ImageApiService } from "@core/services/api/classic/images/image/image-api.service";
import { ThumbnailGroupApiService } from "@core/services/api/classic/images/thumbnail-group/thumbnail-group-api.service";
import { JsonApiService } from "@core/services/api/classic/json/json-api.service";
import { RemoteSourceAffiliateApiService } from "@core/services/api/classic/remote-source-affiliation/remote-source-affiliate-api.service";
import { AuthService } from "@core/services/auth.service";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { UserService } from "@core/services/user.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { MockService, ngMocks } from "ng-mocks";
import { UploadxService } from "ngx-uploadx";
import { EMPTY, of } from "rxjs";
import { GoogleMapsService } from "@core/services/google-maps/google-maps.service";

ngMocks.autoSpy("jest");

ngMocks.defaultMock(NotificationsApiService, () => ({
  getAll: jest.fn().mockReturnValue(of(NotificationListResponseInterfaceGenerator.notificationListResponse())),
  getUnreadCount: jest.fn().mockReturnValue(of(1)),
  update: jest.fn().mockReturnValue(EMPTY),
  markAllAsRead: jest.fn().mockReturnValue(EMPTY)
}));

ngMocks.defaultMock(ThumbnailGroupApiService, () => ({
  getThumbnailGroup: jest.fn().mockReturnValue(EMPTY)
}));

ngMocks.defaultMock(UploadxService, () => ({
  events: EMPTY
}));

ngMocks.defaultMock(ImageApiService, () => ({
  getImage: jest.fn().mockReturnValue(EMPTY)
}));

ngMocks.defaultMock(UserSubscriptionService, () => ({
  fileSizeAllowed: jest.fn().mockReturnValue(EMPTY),
  hasValidSubscription: jest.fn().mockReturnValue(of(false))
}));

ngMocks.defaultMock(AuthService, () => ({
  login: jest.fn().mockReturnValue(of("token-1234567890")),
  isAuthenticated: jest.fn().mockReturnValue(of(true))
}));

// setupJest.ts
ngMocks.defaultMock(WindowRefService, () => ({
  nativeWindow: Object.assign(
    MockService(Window, {
      location: MockService(Location),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      document: MockService(Document)
    }),
    { __proto__: EventTarget.prototype }
  )
}));

// They are not real methods, and we need to provide them manually.
ngMocks.defaultMock(ClassicRoutesService, () => ({
  API_KEYS: jest.fn(),
  BOOKMARKS: jest.fn(),
  COMMERCIAL_PRODUCTS: jest.fn(),
  EDIT_IMAGE_REVISION: jest.fn(),
  EDIT_IMAGE_THUMBNAILS: jest.fn(),
  GALLERY: jest.fn(),
  IMAGE: jest.fn(),
  PLOTS: jest.fn(),
  SET_LANGUAGE: jest.fn(),
  STAGING_GALLERY: jest.fn()
}));

ngMocks.defaultMock(CommonApiService, () => ({
  getUser: jest.fn().mockReturnValue(of(UserGenerator.user())),
  getCurrentUserProfile: jest.fn().mockReturnValue(of(UserProfileGenerator.userProfile())),
  getSubscriptions: jest.fn().mockReturnValue(of(null)),
  getUserSubscriptions: jest.fn().mockReturnValue(of([])),
  getPayments: jest.fn().mockReturnValue(of(null))
}));

ngMocks.defaultMock(UsernameService, () => ({
  getDisplayName$: jest.fn().mockReturnValue(of("astrobin_dev"))
}));

ngMocks.defaultMock(UserService, () => ({
  isInGroup: jest.fn().mockImplementation((_user: UserInterface, name: string) => name === "found")
}));

ngMocks.defaultMock(JsonApiService, () => ({
  getBackendConfig: jest.fn().mockReturnValue(EMPTY)
}));

ngMocks.defaultMock(LoginFormComponent, () => ({
  form: MockService(FormGroup, {
    valid: false
  })
}));

ngMocks.defaultMock(TranslateService, () => ({
  instant: jest.fn().mockImplementation(str => str),
  onLangChange: EMPTY as any
}));

ngMocks.defaultMock(SubscriptionsService, () => ({
  currency$: EMPTY
}));

ngMocks.defaultMock(RemoteSourceAffiliateApiService, () => ({
  getAll: jest.fn().mockReturnValue(of([]))
}));

ngMocks.defaultMock(GoogleMapsService, () => ({
  maps: {},
  loadGoogleMaps: jest.fn().mockReturnValue(Promise.resolve())
}));
