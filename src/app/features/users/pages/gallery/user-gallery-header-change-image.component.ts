import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Observable, of } from "rxjs";
import { map, take } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { AuthActionTypes, ChangeUserProfileGalleryHeaderImage } from "@features/account/store/auth.actions";
import { Actions, ofType } from "@ngrx/effects";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { LoadingService } from "@shared/services/loading.service";

@Component({
  selector: "astrobin-user-gallery-header-change-image",
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <formly-form [form]="form" [fields]="fields" [model]="model"></formly-form>
      <div class="d-flex justify-content-end mt-4">
        <button
          (click)="imageChange.emit(null)"
          class="btn btn-secondary btn-no-block me-2"
          translate="Cancel"
          type="button"
        ></button>
        <button
          [class.loading]="loadingService.loading$ | async"
          [disabled]="!form.valid"
          class="btn btn-primary btn-no-block"
          translate="Select"
          type="submit"
        ></button>
      </div>
    </form>

    <ng-template #imageOptionTemplate let-item="item">
      <div class="image-option-template">
        <div class="row align-items-center">
          <div class="col-2">
            <img [alt]="item.value.title" [src]="getGalleryThumbnail(item.value)" class="w-100" />
          </div>
          <div class="col ps-2">
            <h5 class="title">{{item.value.title}}</h5>
            <div class="uploaded">
              {{ "Published" | translate}}:
              <abbr *ngIf="!!item.value.published; else unpublishedTemplate" [title]="item.value.published | localDate">
                {{ item.value.published | localDate | timeago: true }}
              </abbr>

              <ng-template #unpublishedTemplate>
                <span class="text-muted">{{ "Unpublished" | translate }}</span>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styleUrls: ["./user-gallery-header-change-image.component.scss"]
})
export class UserGalleryHeaderChangeImageComponent extends BaseComponentDirective implements AfterViewInit {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;

  @Output() imageChange = new EventEmitter<ImageInterface>();

  @ViewChild("imageOptionTemplate")
  imageOptionTemplate: TemplateRef<any>;

  protected model: { image: ImageInterface } = { image: null };
  protected form: FormGroup = new FormGroup({});
  protected fields: FormlyFieldConfig[] = [];


  constructor(
    public readonly store$: Store<MainState>,
    public readonly action$: Actions,
    public readonly translateService: TranslateService,
    public readonly imageApiService: ImageApiService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly loadingService: LoadingService
  ) {
    super(store$);
  }

  ngAfterViewInit() {
    this._initFields();
  }

  protected getGalleryThumbnail(image: ImageInterface): string {
    return image.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.GALLERY).url;
  }

  protected onSubmit() {
    if (!this.form.valid) {
      return;
    }

    this.action$.pipe(
      ofType(AuthActionTypes.CHANGE_USER_PROFILE_GALLERY_HEADER_IMAGE_SUCCESS),
      take(1)
    ).subscribe(() => {
      this.imageChange.emit(this.model.image);
      this.popNotificationsService.success(
        this.translateService.instant("Header image changed.")
      );
    });

    this.action$.pipe(
      ofType(AuthActionTypes.CHANGE_USER_PROFILE_GALLERY_HEADER_IMAGE_FAILURE),
      take(1)
    ).subscribe(() => {
      this.popNotificationsService.error(
        this.translateService.instant("Error changing header image!")
      );
    });

    this.store$.dispatch(
      new ChangeUserProfileGalleryHeaderImage({
        id: this.userProfile.id,
        imageId :this.model.image.hash || this.model.image.pk
      })
    );
  }

  private _initFields() {
    this.fields = [
      {
        key: "image",
        type: "ng-select",
        wrappers: ["default-wrapper"],
        props: {
          required: true,
          optionTemplate: this.imageOptionTemplate,
          label: this.translateService.instant("Image"),
          options: of([]),
          onSearch: (q: string): Observable<any[]> => {
            return new Observable<any[]>(observer => {
              if (!q) {
                observer.next();
                observer.complete();
                return;
              }

              const field = this.fields.find(f => f.key === "image");

              this.imageApiService.findImages({
                userId: this.user.id,
                q
              }).pipe(
                map(response => response.results),
                map(images => {
                  return images.map(image => ({
                    value: image,
                    label: image.title
                  }));
                })
              )
                .subscribe(options => {
                  field.props = {
                    ...field.props,
                    options: of(options)
                  };
                  observer.next(options);
                  observer.complete();
                });
            });
          }
        }
      }
    ];
  }
}
