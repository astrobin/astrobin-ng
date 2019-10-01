import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { VendorDetailPageComponent } from "./vendor-detail.page-component";
import { PipesModule } from "@library/pipes/pipes.module";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("VendorDetailPageComponent", () => {
  let component: VendorDetailPageComponent;
  let fixture: ComponentFixture<VendorDetailPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        PipesModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              id: "1",
            }),
          },
        },
      ],
      declarations: [VendorDetailPageComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
