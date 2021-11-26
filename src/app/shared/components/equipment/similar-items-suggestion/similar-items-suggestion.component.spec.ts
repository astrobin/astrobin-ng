import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SimilarItemsSuggestionComponent } from "./similar-items-suggestion.component";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { AppModule } from "@app/app.module";

describe("SimilarItemsSuggestionComponent", () => {
  let component: SimilarItemsSuggestionComponent;
  let fixture: ComponentFixture<SimilarItemsSuggestionComponent>;

  beforeEach(async () => {
    await MockBuilder(SimilarItemsSuggestionComponent, AppModule).provide(provideMockStore({ initialState }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimilarItemsSuggestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
