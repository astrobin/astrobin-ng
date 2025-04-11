import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SimilarItemsSuggestionComponent } from "./similar-items-suggestion.component";

describe("SimilarItemsSuggestionComponent", () => {
  let component: SimilarItemsSuggestionComponent;
  let fixture: ComponentFixture<SimilarItemsSuggestionComponent>;

  beforeEach(async () => {
    await MockBuilder(SimilarItemsSuggestionComponent, AppModule).provide(
      provideMockStore({ initialState: initialMainState })
    );
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
