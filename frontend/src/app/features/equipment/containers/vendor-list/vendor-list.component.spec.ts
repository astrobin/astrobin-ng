import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { VendorListComponent } from "./vendor-list.component";
import { MockComponents } from "ng-mocks";
import { VendorComponent } from "@feats/equipment/containers/vendor/vendor.component";
import { EmptyListComponent } from "@lib/components/misc/empty-list/empty-list.component";
import { Router } from "@angular/router";
import { RouterMock } from "@app/mocks/router.mock";

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
});
