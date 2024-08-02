import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchMountMaxPayloadFilterComponent } from "./search-mount-max-payload-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

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
