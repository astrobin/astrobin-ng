import { Injectable } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import { TranslateService } from "@ngx-translate/core";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { forkJoin, Observable, of } from "rxjs";
import { CommonApiService } from "@shared/services/api/classic/common/common-api.service";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { filter, map, take, tap } from "rxjs/operators";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { FormControl } from "@angular/forms";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import { ImageEditFieldsBaseService } from "@features/image/services/image-edit-fields-base.service";

@Injectable({
  providedIn: null
})
export class ImageEditBasicFieldsService extends ImageEditFieldsBaseService {
  constructor(
    public readonly store$: Store<State>,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly imageEditService: ImageEditService,
    public readonly commonApiService: CommonApiService
  ) {
    super(loadingService);
  }

  onFieldsInitialized(): void {
  }

  getTitleField(): FormlyFieldConfig {
    return {
      key: "title",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "image-title-field",
      props: {
        label: this.translateService.instant("Title"),
        required: true
      }
    };
  }

  getDescriptionHtmlField(): FormlyFieldConfig {
    return {
      key: "description",
      type: "textarea",
      wrappers: ["default-wrapper"],
      id: "image-description-field",
      props: {
        label: this.translateService.instant("Description"),
        description: this.translateService.instant("HTML tags are allowed."),
        required: false,
        rows: 10
      }
    };
  }

  getDescriptionBBCodeField(): FormlyFieldConfig {
    return {
      key: "descriptionBbcode",
      type: "ckeditor",
      wrappers: ["default-wrapper"],
      id: "image-description-field",
      props: {
        label: this.translateService.instant("Description"),
        required: false
      }
    };
  }

  getDescriptionField(): FormlyFieldConfig {
    if (
      this.imageEditService.model.descriptionBbcode ||
      (!this.imageEditService.model.descriptionBbcode && !this.imageEditService.model.description)
    ) {
      return this.getDescriptionBBCodeField();
    }

    return this.getDescriptionHtmlField();
  }

  getPendingCollaboratorsField(): FormlyFieldConfig {
    const ngSelectData = (userProfile: UserProfileInterface): { value: number; label: string } => ({
      value: userProfile.user,
      label: userProfile.realName ? `${userProfile.realName} (${userProfile.username})` : userProfile.username
    });

    const _getField = (): FormlyFieldConfig => {
      return this.imageEditService.fields[0].fieldGroup[0].fieldGroup[2];
    };

    return {
      key: "pendingCollaborators",
      type: "ng-select",
      wrappers: ["default-wrapper"],
      id: "image-pending-collaborators-field",
      props: {
        label: this.translateService.instant("Collaborators"),
        description: this.translateService.instant(
          "If this image was a group effort, please add additional collaborators (other than you) here."
        ),
        multiple: true,
        required: false,
        clearable: true,
        enableFullscreen: false,
        striped: true,
        options: this.imageEditService.model.pendingCollaborators
          ? forkJoin(
            this.imageEditService.model.pendingCollaborators.map(pending_collaborator => {
              return this.commonApiService
                .getUserProfileByUserId(pending_collaborator)
                .pipe(map(userProfile => ngSelectData(userProfile)));
            })
          )
          : of([]),
        onSearch: (term: string): Observable<UserProfileInterface[]> => {
          const field = _getField();
          return this.commonApiService.findUserProfiles(term).pipe(
            tap(userProfiles => {
              field.props = {
                ...field.props,
                options: of(userProfiles.map(userProfile => ngSelectData(userProfile)))
              };
            })
          );
        }
      },
      asyncValidators: {
        notIncludeSelf: {
          expression: (control: FormControl) => {
            return this.store$.select(selectCurrentUser).pipe(
              filter(user => !!user),
              take(1),
              map(user => !control.value || control.value.indexOf(user.id) === -1)
            );
          },
          message: this.translateService.instant("No need to include yourself as a collaborator.")
        }
      }
    };
  }

  getLinkField(): FormlyFieldConfig {
    return {
      key: "link",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "image-link-field",
      props: {
        label: this.translateService.instant("Link"),
        description: this.translateService.instant(
          "If you're hosting a copy of this image on your website, put the address here."
        ),
        placeholder: this.translateService.instant("e.g.") + " https://www.example.com/my-page.html",
        required: false
      },
      validators: {
        validation: ["url"]
      }
    };
  }

  getLinkToFitsField(): FormlyFieldConfig {
    return {
      key: "linkToFits",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "image-link-to-fits-field",
      props: {
        label: this.translateService.instant("Link to TIFF/FITS"),
        description: this.translateService.instant(
          "If you want to share the TIFF or FITS file of your image, put a link to the file here. " +
          "Unfortunately, AstroBin cannot offer to store these files at the moment, so you will have to " +
          "host them on your personal space."
        ),
        placeholder: this.translateService.instant("e.g.") + " https://www.example.com/my-page.html",
        required: false
      },
      validators: {
        validation: ["url"]
      }
    };
  }
}
