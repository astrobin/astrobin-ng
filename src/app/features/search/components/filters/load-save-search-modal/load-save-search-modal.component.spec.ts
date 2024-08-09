import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadSaveSearchModalComponent } from './load-save-search-modal.component';
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { of } from "rxjs";

describe('LoadSaveSearchModalComponent', () => {
  let component: LoadSaveSearchModalComponent;
  let fixture: ComponentFixture<LoadSaveSearchModalComponent>;

  beforeEach(async () => {
    await MockBuilder(LoadSaveSearchModalComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      NgbActiveModal
    ]);

    fixture = TestBed.createComponent(LoadSaveSearchModalComponent);
    component = fixture.componentInstance;

    jest.spyOn(component.savedSearchApiService, 'load').mockReturnValue(of([]));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
