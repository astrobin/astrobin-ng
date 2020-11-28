import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { testAppImports } from "@app/test-app.imports";
import { ReadOnlyModeComponent } from "./read-only-mode.component";

describe("ReadOnlyModeComponent", () => {
  let component: ReadOnlyModeComponent;
  let fixture: ComponentFixture<ReadOnlyModeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: testAppImports,

      declarations: [ReadOnlyModeComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadOnlyModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
