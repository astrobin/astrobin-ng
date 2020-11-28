import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { AuthService } from "@shared/services/auth.service";
import { AuthServiceMock } from "@shared/services/auth.service-mock";
import { of } from "rxjs";
import { LoginFormComponent } from "./login-form.component";

describe("LoginFormComponent", () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [testAppImports],
      declarations: [LoginFormComponent],
      providers: [
        {
          provide: AuthService,
          useClass: AuthServiceMock
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("login", () => {
    it("should unset error on success", () => {
      spyOn(component.authService, "login").and.returnValue(of(true));

      component.login();

      expect(component.error).toBe(false);
    });

    it("should unset error on failure", () => {
      spyOn(component.authService, "login").and.returnValue(of(false));

      component.login();

      expect(component.error).toBe(true);
    });
  });
});
