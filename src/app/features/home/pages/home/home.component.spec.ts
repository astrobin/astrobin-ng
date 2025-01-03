import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { Router } from "@angular/router";
import { EMPTY } from "rxjs";

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await MockBuilder(HomeComponent, AppModule).provide([
      provideMockStore({initialState: initialMainState}),
      {
        provide: Router,
        useValue: {
          events: EMPTY
        }
      }
    ])
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
