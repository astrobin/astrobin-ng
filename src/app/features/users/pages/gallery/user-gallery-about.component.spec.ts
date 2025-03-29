import { ComponentFixture, TestBed } from "@angular/core/testing";
import { UserGalleryAboutComponent } from "./user-gallery-about.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { MockModule, MockProvider } from "ng-mocks";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { UserService } from "@core/services/user.service";
import { Actions } from "@ngrx/effects";
import { of } from "rxjs";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthActionTypes, UpdateUserProfile } from "@features/account/store/auth.actions";
import { UserInterface } from "@core/interfaces/user.interface";
import { UserProfileGenerator } from "@shared/generators/user-profile.generator";
import { UserGenerator } from "@shared/generators/user.generator";
import { MainState } from "@app/store/state";
import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UtilsService } from "@core/services/utils/utils.service";

// Create a real component for mocking
@Component({
  selector: "astrobin-nothing-here",
  template: ""
})
class MockNothingHereComponent {
  @Input() withAlert: boolean;
  @Input() withInfoSign: boolean;
}

// Mock FormlyForm component
@Component({
  selector: "formly-form",
  template: "<div></div>"
})
class MockFormlyFormComponent {
  @Input() form: any;
  @Input() fields: any;
  @Input() model: any;
}

describe("UserGalleryAboutComponent", () => {
  let component: UserGalleryAboutComponent;
  let fixture: ComponentFixture<UserGalleryAboutComponent>;
  let store: MockStore<MainState>;
  let actionsSource: {
    pipe: jest.Mock;
  };

  beforeEach(() => {
    actionsSource = {
      pipe: jest.fn().mockReturnValue(of({
        type: AuthActionTypes.UPDATE_USER_PROFILE_SUCCESS,
        payload: { id: 1 }
      }))
    };

    TestBed.configureTestingModule({
      declarations: [
        UserGalleryAboutComponent,
        MockNothingHereComponent,
        MockFormlyFormComponent
      ],
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MockModule(TranslateModule)
      ],
      providers: [
        provideMockStore(),
        MockProvider(UserService),
        MockProvider(TranslateService, {
          instant: (key: string) => key
        }),
        { provide: Actions, useValue: actionsSource }
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    jest.spyOn(store, "dispatch");

    fixture = TestBed.createComponent(UserGalleryAboutComponent);
    component = fixture.componentInstance;

    component.user = UserGenerator.user({ id: 1 });
    component.userProfile = UserProfileGenerator.userProfile();
    component.userProfile.id = 1;

    // Create form
    component.initForm();

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("form", () => {
    it("should initialize form when editing", () => {
      jest.spyOn(component, "initForm");
      component.toggleEdit();
      expect(component.isEditing).toBe(true);
      expect(component.initForm).toHaveBeenCalled();
    });

    it("should cancel editing", () => {
      component.isEditing = true;
      component.cancelEdit();
      expect(component.isEditing).toBe(false);
    });

    it("should save changes", () => {
      // Mock the form with the necessary properties
      component.model = {
        about: "New about text",
        website: "https://example.com",
        job: "Developer",
        hobbies: "Astronomy"
      };

      // Set up the actions observable to immediately call the subscriber
      actionsSource.pipe.mockImplementation(() => ({
        subscribe: (callback) => {
          callback({ 
            type: AuthActionTypes.UPDATE_USER_PROFILE_SUCCESS,
            payload: { id: 1 }
          });
          return { unsubscribe: jest.fn() };
        }
      }));

      // Mock the form control checks
      component.form.markAsDirty();
      jest.spyOn(component.form, "get").mockReturnValue({
        dirty: true,
        value: "test value"
      } as any);

      component.saveChanges();

      expect(store.dispatch).toHaveBeenCalled();
      expect(component.isLoading).toBe(false); // Should be false after the success callback
    });
    
    it("should ensure website URL has a protocol before saving", () => {
      // Set up a website without protocol
      const websiteWithoutProtocol = "example.com";
      
      // Mock the form with a website value missing protocol
      component.form.markAsDirty();
      const getterMock = jest.fn();
      
      // Create different mock returns for different keys
      getterMock.mockImplementation((key) => {
        if (key === 'website') {
          return {
            dirty: true,
            value: websiteWithoutProtocol
          };
        }
        return {
          dirty: false,
          value: null
        };
      });
      
      jest.spyOn(component.form, "get").mockImplementation(getterMock);
      
      // Mock UtilsService.ensureUrlProtocol
      const ensureUrlProtocolSpy = jest.spyOn(UtilsService, 'ensureUrlProtocol');
      
      // Call saveChanges
      component.saveChanges();
      
      // Verify ensureUrlProtocol was called
      expect(ensureUrlProtocolSpy).toHaveBeenCalledWith(websiteWithoutProtocol);
      
      // Verify store.dispatch was called with a payload that includes the website with protocol
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            website: expect.stringContaining('http://')
          })
        })
      );
    });
    
    it("should validate website URL", () => {
      // Get a reference to the website field config
      const websiteField = component.fields.find(field => field.key === 'website');
      
      // Verify the URL validator is being used
      expect(websiteField.validators).toBeDefined();
      expect(websiteField.validators.validation).toContain('url');
    });

    it("should not save if form is invalid", () => {
      component.form.setErrors({ invalid: true });
      component.saveChanges();
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it("should not save if form is pristine", () => {
      // Ensure form is pristine
      jest.spyOn(component.form, "get").mockReturnValue({
        dirty: false,
        value: ""
      } as any);

      component.saveChanges();
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe("current user detection", () => {
    it("should check if user is current user on init", () => {
      // Mock the Observable that currentUser$ returns
      jest.spyOn(component["currentUser$"], "pipe").mockReturnValue(of({ id: 1 } as UserInterface));

      // Call ngOnInit to trigger the check
      component.ngOnInit();

      expect(component.isCurrentUser).toBe(true);
    });
  });
});
