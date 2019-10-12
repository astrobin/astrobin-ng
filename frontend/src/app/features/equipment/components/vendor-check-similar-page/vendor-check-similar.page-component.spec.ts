import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { VendorCheckSimilarPageComponent } from "./vendor-check-similar.page-component";
import { MockComponents } from "ng-mocks";
import { VendorListComponent } from "@feats/equipment/containers/vendor-list/vendor-list.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ToastrModule } from "ngx-toastr";
import { TranslateModule } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { RouterMock } from "@app/mocks/router.mock";
import { VendorGenerator } from "@shared/generators/vendor.generator";

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

  describe("without session object", () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(VendorCheckSimilarPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it("should create", () => {
      expect(component).toBeTruthy();
    });
  });

  describe("with session object", () => {
    const sessionObject = {
      similar: [
        VendorGenerator.generate(),
        VendorGenerator.generate(),
      ],
      model: VendorGenerator.generate(),
    };

    beforeEach(() => {
      fixture = TestBed.createComponent(VendorCheckSimilarPageComponent);
      component = fixture.componentInstance;
      component.session.put(VendorCheckSimilarPageComponent.SESSION_KEY, sessionObject);
      fixture.detectChanges();
    });

    it("should have set the similar vendors and model", () => {
      expect(component.similarVendors).toEqual(sessionObject.similar);
      expect(component.model).toEqual(sessionObject.model);
    });
  });
});
