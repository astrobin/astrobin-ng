import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchMountMaxPayloadFilterComponent } from "./search-mount-max-payload-filter.component";

describe("MountMaxPayloadFilterComponent", () => {
  let component: SearchMountMaxPayloadFilterComponent;
  let fixture: ComponentFixture<SearchMountMaxPayloadFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchMountMaxPayloadFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchMountMaxPayloadFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
