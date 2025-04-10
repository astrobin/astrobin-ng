import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { ReviewGearRenamingProposalsComponent } from "./review-gear-renaming-proposals.component";

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
              paramMap: { get: () => "camera" }
            }
          }
        }
      ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewGearRenamingProposalsComponent);
    component = fixture.componentInstance;

    jest.spyOn(component, "getProposals").mockImplementation(() => {
      return [];
    });

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
