import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ReadOnlyModeComponent } from "./read-only-mode.component";

describe("ReadOnlyModeComponent", () => {
  let component: ReadOnlyModeComponent;
  let fixture: ComponentFixture<ReadOnlyModeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
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
