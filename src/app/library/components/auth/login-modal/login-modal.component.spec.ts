import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { LoginFormComponent } from "@lib/components/auth/login-form/login-form.component";
import { WindowRefService } from "@lib/services/window-ref.service";
import { NgbActiveModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { TranslateModule } from "@ngx-translate/core";
import { LoginModalComponent } from "./login-modal.component";

describe("LoginModalComponent", () => {
  let component: LoginModalComponent;
  let fixture: ComponentFixture<LoginModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgbModalModule,
        ReactiveFormsModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      declarations: [LoginModalComponent, LoginFormComponent],
      providers: [NgbActiveModal, WindowRefService]
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
