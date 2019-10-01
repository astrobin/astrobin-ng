import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { VendorCreatePageComponent } from "./vendor-create.page-component";
import { ReactiveFormsModule } from "@angular/forms";
import { MockComponents } from "ng-mocks";
import { FormlyForm } from "@ngx-formly/core";
import { TranslateModule } from "@ngx-translate/core";
import { ValidationLoader } from "@library/services/validation-loader.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterMock } from "@astrobin/mocks/router.mock";
import { Router } from "@angular/router";
import { ToastrModule } from "ngx-toastr";
import { AuthService } from "@library/services/auth.service";

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
});
