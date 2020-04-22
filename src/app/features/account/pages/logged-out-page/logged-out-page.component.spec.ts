import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { TranslateModule } from "@ngx-translate/core";
import { LoggedOutPageComponent } from "./logged-out-page.component";

describe("LoggedOutPageComponent", () => {
  let component: LoggedOutPageComponent;
  let fixture: ComponentFixture<LoggedOutPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [LoggedOutPageComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoggedOutPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
