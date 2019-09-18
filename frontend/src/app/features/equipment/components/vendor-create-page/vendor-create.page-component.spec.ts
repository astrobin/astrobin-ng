import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { VendorCreatePageComponent } from "./vendor-create.page-component";

describe("VendorCreatePageComponent", () => {
  let component: VendorCreatePageComponent;
  let fixture: ComponentFixture<VendorCreatePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VendorCreatePageComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorCreatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
