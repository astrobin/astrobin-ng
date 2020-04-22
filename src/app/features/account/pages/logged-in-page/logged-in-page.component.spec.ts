import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { WindowRefService } from "@lib/services/window-ref.service";
import { TranslateModule } from "@ngx-translate/core";
import { LoggedInPageComponent } from "./logged-in-page.component";

describe("LoggedInPageComponent", () => {
  let component: LoggedInPageComponent;
  let fixture: ComponentFixture<LoggedInPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, TranslateModule.forRoot()],
      declarations: [LoggedInPageComponent],
      providers: [WindowRefService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoggedInPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
