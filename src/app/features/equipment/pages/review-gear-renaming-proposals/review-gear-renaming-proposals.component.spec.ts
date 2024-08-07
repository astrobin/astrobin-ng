import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ReviewGearRenamingProposalsComponent } from "./review-gear-renaming-proposals.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { ActivatedRoute } from "@angular/router";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ReviewGearRenamingProposalsComponent", () => {
  let component: ReviewGearRenamingProposalsComponent;
  let fixture: ComponentFixture<ReviewGearRenamingProposalsComponent>;

  beforeEach(async () => {
    await MockBuilder(ReviewGearRenamingProposalsComponent, AppModule)
      .replace(HttpClientModule, HttpClientTestingModule)
      .provide([
        provideMockStore({ initialState: initialMainState }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: key => "camera" }
            }
          }
        }
      ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewGearRenamingProposalsComponent);
    component = fixture.componentInstance;

    jest.spyOn(component, "getProposals").mockImplementation(() => {
    });

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
