import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { LoginFormComponent } from "@lib/components/auth/login-form/login-form.component";
import { WindowRefService } from "@lib/services/window-ref.service";
import { TranslateModule } from "@ngx-translate/core";
import { LoginPageComponent } from "./login-page.component";

describe("LoginPageComponent", () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule, RouterTestingModule, TranslateModule.forRoot()],
      declarations: [LoginPageComponent, LoginFormComponent],
      providers: [WindowRefService]
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
