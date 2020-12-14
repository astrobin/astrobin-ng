import { LoginModalComponent } from "./login-modal.component";
import { MockBuilder, MockRender } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

describe("LoginModalComponent", () => {
  let component: LoginModalComponent;

  beforeEach(() => MockBuilder(LoginModalComponent, AppModule).provide(NgbActiveModal));
  beforeEach(() => (component = MockRender(LoginModalComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
