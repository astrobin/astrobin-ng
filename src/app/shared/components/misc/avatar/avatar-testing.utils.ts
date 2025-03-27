import { ChangeDetectorRef, NO_ERRORS_SCHEMA, Pipe, PipeTransform, PLATFORM_ID as ANGULAR_PLATFORM_ID, Type } from "@angular/core";
import { NgbActiveOffcanvas, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { CustomWindowInterface, WindowRefService } from "@core/services/window-ref.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { UserService } from "@core/services/user.service";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { Observable, of } from "rxjs";
import { UserInterface } from "@core/interfaces/user.interface";
import { TestBed } from "@angular/core/testing";
import { CommonApiService } from "@core/services/api/classic/common/common-api.service";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { Router } from "@angular/router";


// @ts-ignore - Used only in tests
@Pipe({ name: "translate", standalone: true })
export class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

export interface MockStoreOptions {
  select?: (...args: any[]) => Observable<any>;
  dispatch?: (action: any) => void;
}

export function createMockStore(options?: MockStoreOptions): Partial<Store<any>> {
  return {
    select: options?.select || jest.fn().mockImplementation(() => of(null)),
    dispatch: options?.dispatch || jest.fn()
  };
}

export function createMockOffcanvasService(): Partial<NgbOffcanvas> {
  // Create a mock offcanvas reference
  const mockOffcanvasRef = {
    componentInstance: {
      user: null,
      avatarUpdated: {
        subscribe: jest.fn()
      }
    }
  };

  return {
    open: jest.fn().mockImplementation((component, options) => {
      // Process beforeDismiss option if provided
      if (options && typeof options.beforeDismiss === 'function') {
        options.beforeDismiss();
      }
      return mockOffcanvasRef;
    })
  };
}

export function createMockChangeDetectorRef(): Partial<ChangeDetectorRef> {
  return {
    markForCheck: jest.fn()
  };
}

export function createMockUserService(): Partial<UserService> {
  return {
    openGallery: jest.fn(),
    getGalleryUrl: jest.fn().mockReturnValue("https://example.com/gallery"),
    openStaging: jest.fn(),
    getStagingUrl: jest.fn().mockReturnValue("https://example.com/staging")
  };
}

export function createMockCommonApiService(): Partial<CommonApiService> {
  return {
    // Add appropriate properties based on your CommonApiService interface
  } as Partial<CommonApiService>;
}

export function createMockLoadingService(): Partial<LoadingService> {
  return {
    setLoading: jest.fn()
  };
}

export function createMockPopNotificationsService(): Partial<PopNotificationsService> {
  return {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn()
  };
}

export function createMockTranslateService(): Partial<TranslateService> {
  return {
    instant: jest.fn().mockImplementation(key => key)
  };
}

class MockImage {
  onload: Function;
  src: string;
}

export function createMockWindowRefService(): Partial<WindowRefService> {
  return {
    nativeWindow: {
      document: {} as Document,
      innerWidth: 1024,
      innerHeight: 768
      // Cast the window object to any to allow adding the Image class
      // This is fine for testing purposes
    } as unknown as CustomWindowInterface,
    // Add Image class to the global window for testing
    ...(global.Image = MockImage as any)
  };
}

export function createMockUtilsService(): Partial<UtilsService> {
  return {
    delay: jest.fn().mockReturnValue(of(null))
  };
}

export function createMockClassicRoutesService(): Partial<ClassicRoutesService> {
  return {
    API_KEYS: jest.fn().mockImplementation(user => `https://api-keys/${user.id}`),
    SETTINGS: "https://settings",
    INBOX: "https://inbox"
  };
}

export function createMockUserSubscriptionService(): Partial<UserSubscriptionService> {
  return {};
}

export function createMockActiveOffcanvas(): Partial<NgbActiveOffcanvas> {
  return {
    dismiss: jest.fn()
  };
}

/**
 * Configures TestBed for avatar component tests using standard TestBed
 */
export function setupAvatarTestingModule<T>(componentType: Type<T>) {
  TestBed.configureTestingModule({
    declarations: [
      componentType
    ],
    imports: [
      MockTranslatePipe
    ],
    providers: [
      { provide: Store, useFactory: createMockStore },
      { provide: ChangeDetectorRef, useFactory: createMockChangeDetectorRef },
      { provide: NgbOffcanvas, useFactory: createMockOffcanvasService },
      { provide: NgbActiveOffcanvas, useFactory: createMockActiveOffcanvas },
      { provide: UserService, useFactory: createMockUserService },
      { provide: CommonApiService, useFactory: createMockCommonApiService },
      { provide: LoadingService, useFactory: createMockLoadingService },
      { provide: PopNotificationsService, useFactory: createMockPopNotificationsService },
      { provide: TranslateService, useFactory: createMockTranslateService },
      { provide: WindowRefService, useFactory: createMockWindowRefService },
      { provide: UtilsService, useFactory: createMockUtilsService },
      { provide: ClassicRoutesService, useFactory: createMockClassicRoutesService },
      { provide: UserSubscriptionService, useFactory: createMockUserSubscriptionService },
      { provide: Router, useValue: {} },
      { provide: ANGULAR_PLATFORM_ID, useValue: PLATFORM_ID_VALUE }
    ],
    schemas: [NO_ERRORS_SCHEMA] // For unknown elements like fa-icon
  });
}

/**
 * Hooks up a component that extends BaseComponentDirective with the proper observables
 */
export function setupComponentObservables(component: any, user: UserInterface | null = null) {
  // Set the observables directly on the component
  // Use any type to bypass TypeScript checking for properties
  // as we're manipulating private properties for testing
  component.currentUser$ = of(user);
  component.currentUserProfile$ = of(null);
  component.readOnlyMode$ = of(false);
}

export const PLATFORM_ID_VALUE = "browser";
