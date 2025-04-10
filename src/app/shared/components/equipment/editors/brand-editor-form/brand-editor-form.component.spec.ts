import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { UtilsService } from "@core/services/utils/utils.service";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { BrandEditorFormComponent } from "./brand-editor-form.component";

describe("BrandEditorComponent", () => {
  let component: BrandEditorFormComponent;
  let fixture: ComponentFixture<BrandEditorFormComponent>;

  beforeEach(async () => {
    await MockBuilder(BrandEditorFormComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      UtilsService
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandEditorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
