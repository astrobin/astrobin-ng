import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { WindowRefService } from "@shared/services/window-ref.service";
import { LoggedInPageComponent } from "./logged-in-page.component";

describe("LoggedInPageComponent", () => {
  let component: LoggedInPageComponent;
  let fixture: ComponentFixture<LoggedInPageComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [testAppImports],
        declarations: [LoggedInPageComponent],
        providers: [WindowRefService]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LoggedInPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
