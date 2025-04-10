import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { UtilsService } from "@core/services/utils/utils.service";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { TelescopeComponent } from "./telescope.component";

describe("TelescopeComponent", () => {
  let component: TelescopeComponent;
  let fixture: ComponentFixture<TelescopeComponent>;

  beforeEach(async () => {
    await MockBuilder(TelescopeComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      UtilsService
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TelescopeComponent);
    component = fixture.componentInstance;
    component.id = 1;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
