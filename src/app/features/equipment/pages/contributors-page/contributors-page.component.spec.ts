import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ContributorsPageComponent } from "./contributors-page.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { ItemTypeNavComponent } from "@features/equipment/components/item-type-nav/item-type-nav.component";

describe("ContributorsPageComponent", () => {
  let component: ContributorsPageComponent;
  let fixture: ComponentFixture<ContributorsPageComponent>;

  beforeEach(async () => {
    await MockBuilder(ContributorsPageComponent, AppModule)
      .provide([provideMockStore({ initialState: initialMainState })])
      .mock(ItemTypeNavComponent, { export: true });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContributorsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
