import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { WindowRefService } from "@lib/services/window-ref.service";
import { NgbActiveModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { TranslateModule } from "@ngx-translate/core";
import { of } from "rxjs";
import { LoginModalComponent } from "./login-modal.component";

describe("LoginModalComponent", () => {
  let component: LoginModalComponent;
  let fixture: ComponentFixture<LoginModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, NgbModalModule, TranslateModule.forRoot()],
      declarations: [LoginModalComponent],
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

  describe("login", () => {
    it("should unset error and close modal on success", () => {
      spyOn(component.authService, "login").and.returnValue(of(true));
      spyOn(component.activeModal, "close");

      component.login();

      expect(component.error).toBe(false);
      expect(component.activeModal.close).toHaveBeenCalled();
    });

    it("should unset error on failure", () => {
      spyOn(component.authService, "login").and.returnValue(of(false));
      spyOn(component.activeModal, "close");

      component.login();

      expect(component.error).toBe(true);
      expect(component.activeModal.close).not.toHaveBeenCalled();
    });
  });
});
