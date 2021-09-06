import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SimilarItemsSuggestionComponent } from "./similar-items-suggestion.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";

describe("SimilarItemsSuggestionComponent", () => {
  let component: SimilarItemsSuggestionComponent;
  let fixture: ComponentFixture<SimilarItemsSuggestionComponent>;

  beforeEach(async () => {
    await MockBuilder(SimilarItemsSuggestionComponent, EquipmentModule);
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
