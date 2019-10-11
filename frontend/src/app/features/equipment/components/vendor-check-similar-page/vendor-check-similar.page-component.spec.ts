import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { VendorCheckSimilarPageComponent } from "./vendor-check-similar.page-component";
import { MockComponents } from "ng-mocks";
import { VendorListComponent } from "@feats/equipment/containers/vendor-list/vendor-list.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ToastrModule } from "ngx-toastr";
import { TranslateModule } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { RouterMock } from "@app/mocks/router.mock";

describe("VendorCheckSimilarPageComponent", () => {
  let component: VendorCheckSimilarPageComponent;
  let fixture: ComponentFixture<VendorCheckSimilarPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ToastrModule.forRoot(),
        TranslateModule.forRoot(),
      ],
      providers: [
        {
          provide: Router,
          useClass: RouterMock,
        },
      ],
      declarations: [
        VendorCheckSimilarPageComponent,
        MockComponents(
          VendorListComponent,
        ),
      ],
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
