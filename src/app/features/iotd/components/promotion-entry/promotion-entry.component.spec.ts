import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PromotionEntryComponent } from "./promotion-entry.component";

describe("PromotionEntryComponent", () => {
  let component: PromotionEntryComponent;
  let fixture: ComponentFixture<PromotionEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromotionEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromotionEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
