import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TogglePropertyInterface } from "@shared/interfaces/toggle-property.interface";
import { TranslateService } from "@ngx-translate/core";
import { selectToggleProperty } from "@app/store/selectors/app/toggle-property.selectors";
import { Observable } from "rxjs";
import { LoadingService } from "@shared/services/loading.service";
import {
  CreateToggleProperty,
  DeleteToggleProperty,
  LoadToggleProperty
} from "@app/store/actions/toggle-property.actions";
import { takeUntil, tap } from "rxjs/operators";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { UtilsService } from "@shared/services/utils/utils.service";

@Component({
  selector: "astrobin-toggle-property",
  templateUrl: "./toggle-property.component.html",
  styleUrls: ["./toggle-property.component.scss"]
})
export class TogglePropertyComponent extends BaseComponentDirective implements OnInit {
  @Input()
  propertyType: TogglePropertyInterface["propertyType"];

  @Input()
  userId: TogglePropertyInterface["user"];

  @Input()
  objectId: TogglePropertyInterface["objectId"];

  @Input()
  contentType: TogglePropertyInterface["contentType"];

  toggleProperty$: Observable<TogglePropertyInterface | null>;

  // We keep a local "loading" state because we don't want to freeze the whole app.
  loading = false;

  buttonState: "default" | "success" = "default";

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly utilsService: UtilsService
  ) {
    super(store$);
  }

  get setTogglePropertyLabel(): string {
    switch (this.propertyType) {
      case "like":
        return this.translateService.instant("Like");
      case "bookmark":
        return this.translateService.instant("Bookmark");
      case "follow":
        return this.translateService.instant("Follow");
    }
  }

  get unsetTogglePropertyLabel(): string {
    switch (this.propertyType) {
      case "like":
        return this.translateService.instant("Unlike");
      case "bookmark":
        return this.translateService.instant("Remove bookmark");
      case "follow":
        return this.translateService.instant("Unfollow");
    }
  }

  public ngOnInit(): void {
    super.ngOnInit();

    const params: Partial<TogglePropertyInterface> = {
      propertyType: this.propertyType,
      user: this.userId,
      objectId: this.objectId,
      contentType: this.contentType
    };

    this.toggleProperty$ = this.store$
      .select(selectToggleProperty(params))
      .pipe(tap(toggleProperty => console.log("toggleProperty", toggleProperty)));

    this.store$.dispatch(new LoadToggleProperty({ toggleProperty: params }));

    this.actions$.pipe(
      ofType(
        AppActionTypes.CREATE_TOGGLE_PROPERTY_SUCCESS,
        AppActionTypes.CREATE_TOGGLE_PROPERTY_FAILURE,
        AppActionTypes.DELETE_TOGGLE_PROPERTY_SUCCESS,
        AppActionTypes.DELETE_TOGGLE_PROPERTY_FAILURE
      ),
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this.loading = false;
    });

    this.actions$.pipe(
      ofType(
        AppActionTypes.CREATE_TOGGLE_PROPERTY_SUCCESS,
        AppActionTypes.DELETE_TOGGLE_PROPERTY_SUCCESS
      ),
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this.buttonState = "success";

      this.utilsService.delay(1000).subscribe(() => {
        this.buttonState = "default";
      });
    });
  }

  public onClick(toggleProperty: Partial<TogglePropertyInterface>): void {
    this.loading = true;

    if (!!toggleProperty) {
      this.store$.dispatch(new DeleteToggleProperty({ toggleProperty }));
    } else {
      this.store$.dispatch(
        new CreateToggleProperty({
          toggleProperty: {
            propertyType: this.propertyType,
            user: this.userId,
            objectId: this.objectId,
            contentType: this.contentType
          }
        })
      );
    }
  }
}
