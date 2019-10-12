import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { VendorListComponent } from "./vendor-list.component";
import { MockComponents } from "ng-mocks";
import { VendorComponent } from "@feats/equipment/containers/vendor/vendor.component";
import { EmptyListComponent } from "@lib/components/misc/empty-list/empty-list.component";
import { Router } from "@angular/router";
import { RouterMock } from "@app/mocks/router.mock";
import { By } from "@angular/platform-browser";
import { VendorGenerator } from "@shared/generators/vendor.generator";

describe("VendorListComponent", () => {
  let component: VendorListComponent;
  let fixture: ComponentFixture<VendorListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useClass: RouterMock,
        }
      ],
      declarations: [
        VendorListComponent,
        MockComponents(
          VendorComponent,
          EmptyListComponent,
        ),
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should display the empty list message when there are no vendors", () => {
    expect(fixture.debugElement.query(By.directive(EmptyListComponent))).not.toBeNull();
  });

  it("should display vendors", () => {
    component.vendors = [
      VendorGenerator.generate(),
      VendorGenerator.generate(),
      VendorGenerator.generate()
    ];

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(EmptyListComponent))).toBeNull();
    expect(fixture.debugElement.queryAll(By.directive(VendorComponent)).length).toBe(3);
  });
});
