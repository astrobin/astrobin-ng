import type { AfterViewInit, OnInit } from "@angular/core";
import { Component, Input } from "@angular/core";
import { LoadCamera } from "@app/store/actions/camera.actions";
import type { MainState } from "@app/store/state";
import type { CameraInterface } from "@core/interfaces/camera.interface";
import type { GearService } from "@core/services/gear/gear.service";
import type { UtilsService } from "@core/services/utils/utils.service";
import type { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import type { Observable } from "rxjs";

@Component({
  selector: "astrobin-camera",
  templateUrl: "./camera.component.html",
  styleUrls: ["./camera.component.scss"]
})
export class CameraComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  camera$: Observable<CameraInterface>;

  @Input()
  id: number;

  @Input()
  loadDelay = 0;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly gearService: GearService,
    public readonly utilsService: UtilsService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    if (this.id === undefined) {
      throw new Error("Attribute 'id' is required");
    }

    this.camera$ = this.store$.select(state => {
      const cameras = state.app.cameras.filter(camera => camera.pk === this.id);
      return cameras.length > 0 ? cameras[0] : null;
    });
  }

  ngAfterViewInit() {
    this.utilsService.delay(this.loadDelay).subscribe(() => {
      this.store$.dispatch(new LoadCamera(this.id));
    });
  }
}
