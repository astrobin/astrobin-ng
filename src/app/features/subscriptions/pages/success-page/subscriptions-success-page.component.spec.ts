import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ActivatedRoute } from "@angular/router";
import { testAppImports } from "@app/test-app.imports";
import { testAppProviders } from "@app/test-app.providers";
import { ImageGenerator } from "@shared/generators/image.generator";
import { SubscriptionsSuccessPageComponent } from "./subscriptions-success-page.component";

describe("SuccessPageComponent", () => {
  let component: SubscriptionsSuccessPageComponent;
  let fixture: ComponentFixture<SubscriptionsSuccessPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [testAppImports],
      providers: [
        ...testAppProviders,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {
                product: "lite"
              }
            }
          }
        }
      ],
      declarations: [SubscriptionsSuccessPageComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionsSuccessPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
