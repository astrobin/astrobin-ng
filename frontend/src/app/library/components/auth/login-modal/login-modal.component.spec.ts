import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { LoginModalComponent } from "./login-modal.component";
import { ReactiveFormsModule } from "@angular/forms";
import { NgbActiveModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("LoginModalComponent", () => {
  let component: LoginModalComponent;
  let fixture: ComponentFixture<LoginModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        NgbModalModule,
      ],
      declarations: [
        LoginModalComponent
      ],
      providers: [
        NgbActiveModal
      ]
    })
      .compileComponents();
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
