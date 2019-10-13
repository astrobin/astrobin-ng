import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { VendorCreatePageComponent } from "./vendor-create.page-component";
import { ReactiveFormsModule } from "@angular/forms";
import { MockComponents } from "ng-mocks";
import { FormlyForm } from "@ngx-formly/core";
import { TranslateModule } from "@ngx-translate/core";
import { ValidationLoader } from "@lib/services/validation-loader.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterMock } from "@app/mocks/router.mock";
import { Router } from "@angular/router";
import { ToastrModule } from "ngx-toastr";
import { AuthService } from "@lib/services/auth.service";
import { VendorGenerator } from "@shared/generators/vendor.generator";
import { of } from "rxjs";
import { VendorCheckSimilarPageComponent } from "@feats/equipment/components/vendor-check-similar-page/vendor-check-similar.page-component";

describe("VendorCreatePageComponent", () => {
  let component: VendorCreatePageComponent;
  let fixture: ComponentFixture<VendorCreatePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        ToastrModule.forRoot(),
        TranslateModule.forRoot(),
      ],
      providers: [
        ValidationLoader,
        {
          provide: Router,
          useClass: RouterMock,
        },
        {
          provide: AuthService,
          useValue: {
            userId: () => "1"
          }
        }
      ],
      declarations: [
        VendorCreatePageComponent,
        MockComponents(
          FormlyForm,
        ),
      ],
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

  describe("submit", () => {
    beforeEach(() => {
      spyOn(component.vendorService, "create");
      spyOn(component.session, "put");
      spyOn(component.router, "navigate");
    });

    it("should do nothing if form is invalid", () => {
      component.submit(VendorGenerator.generate());

      expect(component.vendorService.create).not.toHaveBeenCalled();
    });

    it("should redirect to check-similar page if another vendor with the same name is found", () => {
      const vendor = VendorGenerator.generate();

      spyOn(component.vendorApi, "retrieveByName").and.returnValue(of([vendor]));
      spyOn(component.vendorApi, "findSimilar").and.returnValue(of([]));

      component.submit(vendor);

      expect(component.vendorService.create).not.toHaveBeenCalled();
      expect(component.session.put).toHaveBeenCalledWith(
        VendorCheckSimilarPageComponent.SESSION_KEY,
        { similar: [vendor], model: vendor}
      );
      expect(component.router.navigate).toHaveBeenCalledWith(["/equipment/vendors/create/check-similar"]);
    });

    it("should redirect to check-similar page if another vendor with a similar name is found", () => {
      const vendor = VendorGenerator.generate();

      spyOn(component.vendorApi, "retrieveByName").and.returnValue(of([]));
      spyOn(component.vendorApi, "findSimilar").and.returnValue(of([vendor]));

      component.submit(vendor);

      expect(component.vendorService.create).not.toHaveBeenCalled();
      expect(component.session.put).toHaveBeenCalledWith(
        VendorCheckSimilarPageComponent.SESSION_KEY,
        { similar: [vendor], model: vendor}
      );
      expect(component.router.navigate).toHaveBeenCalledWith(["/equipment/vendors/create/check-similar"]);
    });

    it("should create vendor if nothing similar is found", () => {
      const vendor = VendorGenerator.generate();

      spyOn(component.vendorApi, "retrieveByName").and.returnValue(of([]));
      spyOn(component.vendorApi, "findSimilar").and.returnValue(of([]));

      component.submit(vendor);

      expect(component.vendorService.create).toHaveBeenCalled();
      expect(component.router.navigate).not.toHaveBeenCalled();
    });
  });
});
