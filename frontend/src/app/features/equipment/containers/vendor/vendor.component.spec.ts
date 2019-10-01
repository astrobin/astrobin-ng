import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { VendorComponent } from "./vendor.component";
import { PipesModule } from "@library/pipes/pipes.module";
import { VendorInterface } from "@shared/interfaces/equipment/vendor.interface";

describe("VendorComponent", () => {
  let component: VendorComponent;
  let fixture: ComponentFixture<VendorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        PipesModule,
      ],
      declarations: [VendorComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorComponent);
    component = fixture.componentInstance;

    component.vendor = {
      name: "Test Vendor",
      website: "www.vendor.dom",
      description: "Description"
    } as VendorInterface;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
