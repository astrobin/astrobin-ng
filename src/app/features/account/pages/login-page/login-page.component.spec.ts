import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { LoginFormComponent } from "@shared/components/auth/login-form/login-form.component";
import { WindowRefService } from "@shared/services/window-ref.service";
import { TimeagoIntl } from "ngx-timeago";
import { LoginPageComponent } from "./login-page.component";

describe("LoginPageComponent", () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [testAppImports],
      declarations: [LoginPageComponent, LoginFormComponent],
      providers: [TimeagoIntl, WindowRefService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
