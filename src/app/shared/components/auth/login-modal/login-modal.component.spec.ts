import { DomSanitizer } from "@angular/platform-browser";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockRender } from "ng-mocks";

import { LoginModalComponent } from "./login-modal.component";

describe("LoginModalComponent", () => {
  let component: LoginModalComponent;

  beforeEach(() =>
    MockBuilder(LoginModalComponent, AppModule).provide([
      NgbActiveModal,
      provideMockStore({ initialState: initialMainState }),
      {
        provide: DomSanitizer,
        useValue: {
          sanitize: () => "safeString",
          bypassSecurityTrustHtml: () => "safeString"
        }
      }
    ])
  );
  beforeEach(() => (component = MockRender(LoginModalComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
