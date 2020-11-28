import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { LoginFormComponent } from "@shared/components/auth/login-form/login-form.component";
import { WindowRefService } from "@shared/services/window-ref.service";
import { TimeagoIntl } from "ngx-timeago";
import { LoginModalComponent } from "./login-modal.component";

describe("LoginModalComponent", () => {
  let component: LoginModalComponent;
  let fixture: ComponentFixture<LoginModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [testAppImports],
      declarations: [LoginModalComponent, LoginFormComponent],
      providers: [NgbActiveModal, TimeagoIntl, WindowRefService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
