import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { VendorCheckSimilarPageComponent } from "./vendor-check-similar.page-component";

describe("VendorCheckSimilarPAgeComponent", () => {
  let component: VendorCheckSimilarPageComponent;
  let fixture: ComponentFixture<VendorCheckSimilarPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VendorCheckSimilarPageComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorCheckSimilarPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
