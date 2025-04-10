import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { initialMainState } from "@app/store/state";
import { IotdModule } from "@features/iotd/iotd.module";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";

import { ReviewSlotsComponent } from "./review-slots.component";

describe("ReviewSlotsComponent", () => {
  let component: ReviewSlotsComponent;
  let fixture: ComponentFixture<ReviewSlotsComponent>;

  beforeEach(
    async () =>
      await MockBuilder(ReviewSlotsComponent, IotdModule).provide([
        {
          provide: ActivatedRoute,
          useValue: {
            fragment: of("")
          }
        },
        provideMockStore({ initialState: initialMainState })
      ])
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewSlotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
