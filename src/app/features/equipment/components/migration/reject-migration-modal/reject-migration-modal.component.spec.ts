import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { MigrationFlag } from "@core/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { ReplaySubject } from "rxjs";

import { RejectMigrationModalComponent } from "./reject-migration-modal.component";

describe("RejectMigrationModalComponent", () => {
  let component: RejectMigrationModalComponent;
  let fixture: ComponentFixture<RejectMigrationModalComponent>;

  beforeEach(async () => {
    await MockBuilder(RejectMigrationModalComponent, AppModule).provide([
      NgbActiveModal,
      provideMockStore({ initialState: initialMainState }),
      provideMockActions(() => new ReplaySubject<any>())
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectMigrationModalComponent);
    component = fixture.componentInstance;
    component.migrationStrategy = {
      migrationFlag: MigrationFlag.NOT_ENOUGH_INFO
    };
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
