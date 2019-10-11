import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { VendorListPageComponent } from "./vendor-list.page-component";
import { MockComponents } from "ng-mocks";
import { VendorListComponent } from "@feats/equipment/containers/vendor-list/vendor-list.component";
import { ActivatedRoute } from "@angular/router";

describe("VendorListPageComponent", () => {
  let component: VendorListPageComponent;
  let fixture: ComponentFixture<VendorListPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                vendors: [],
              },
            },
          },
        },
      ],
      declarations: [
        VendorListPageComponent,
        MockComponents(
          VendorListComponent,
        ),
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
