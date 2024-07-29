import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchRemoteSourceFilterComponent } from "./search-remote-source-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("RemoteSourceFilterComponent", () => {
  let component: SearchRemoteSourceFilterComponent;
  let fixture: ComponentFixture<SearchRemoteSourceFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchRemoteSourceFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchRemoteSourceFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
