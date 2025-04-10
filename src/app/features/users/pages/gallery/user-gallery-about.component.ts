import { OnInit, ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MainState } from "@app/store/state";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { UserService } from "@core/services/user.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { AuthActionTypes, UpdateUserProfile } from "@features/account/store/auth.actions";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { filter, take } from "rxjs/operators";

@Component({
  selector: "astrobin-user-gallery-about",
  template: `
    <div class="about-section">
      <ng-container *ngIf="!isEditing; else editingTemplate">
        <ng-container
          *ngIf="
            userProfile.about || userProfile.job || userProfile.hobbies || userProfile.website;
            else noAboutTemplate
          "
        >
          <div *ngIf="userProfile.about" class="about">
            <h5 translate="About"></h5>
            <p [innerHTML]="userProfile.about"></p>
          </div>

          <div *ngIf="userProfile.website" class="website">
            <h5 translate="Website"></h5>
            <a [href]="userProfile.website" target="_blank" rel="noopener">
              {{ userProfile.website }}
            </a>
          </div>

          <div *ngIf="userProfile.job" class="job">
            <h5 translate="Job"></h5>
            <p [innerHTML]="userProfile.job"></p>
          </div>

          <div *ngIf="userProfile.hobbies" class="hobbies">
            <h5 translate="Hobbies"></h5>
            <p [innerHTML]="userProfile.hobbies"></p>
          </div>

          <button
            *ngIf="isCurrentUser"
            class="btn btn-outline-primary btn-sm mt-4"
            (click)="toggleEdit()"
            translate="Edit"
          ></button>
        </ng-container>
      </ng-container>

      <ng-template #editingTemplate>
        <form [formGroup]="form">
          <formly-form [form]="form" [fields]="fields" [model]="model"></formly-form>

          <div class="d-flex justify-content-end mt-4">
            <button
              class="btn btn-outline-secondary btn-no-block btn-sm me-2"
              (click)="cancelEdit()"
              [disabled]="isLoading"
              translate="Cancel"
            ></button>
            <button
              class="btn btn-primary btn-no-block btn-sm"
              [class.loading]="isLoading"
              (click)="saveChanges()"
              [disabled]="form.pristine || isLoading"
              translate="Save"
            ></button>
          </div>
        </form>
      </ng-template>

      <ng-template #noAboutTemplate>
        <div *ngIf="isCurrentUser">
          <p class="text-muted text-center" translate="You haven't added any information about yourself yet."></p>
          <div class="text-center">
            <button class="btn btn-outline-primary btn-sm" (click)="toggleEdit()" translate="Add info"></button>
          </div>
        </div>
        <astrobin-nothing-here
          *ngIf="!isCurrentUser"
          [withAlert]="false"
          [withInfoSign]="false"
        ></astrobin-nothing-here>
      </ng-template>
    </div>
  `,
  styleUrls: ["./user-gallery-about.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGalleryAboutComponent extends BaseComponentDirective implements OnInit {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;

  form = new FormGroup({});
  model: Partial<UserProfileInterface> = {};
  fields: FormlyFieldConfig[] = [];
  isEditing = false;
  isLoading = false;
  isCurrentUser = false;

  private _checkIsCurrentUser(): void {
    this.currentUser$.pipe(take(1)).subscribe(currentUser => {
      if (currentUser && this.user) {
        this.isCurrentUser = currentUser.id === this.user.id;
      }
    });
  }

  constructor(
    public readonly store$: Store<MainState>,
    private readonly userService: UserService,
    private readonly translateService: TranslateService,
    private readonly actions$: Actions
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._checkIsCurrentUser();
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;

    if (this.isEditing) {
      this.initForm();
    }
  }

  initForm(): void {
    this.model = {
      about: this.userProfile?.about || "",
      website: this.userProfile?.website || "",
      job: this.userProfile?.job || "",
      hobbies: this.userProfile?.hobbies || ""
    };

    this.fields = [
      {
        key: "about",
        type: "textarea",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("About"),
          description: this.translateService.instant(
            "Tell the community about yourself, your interests in astronomy, and your astrophotography journey."
          ),
          rows: 8
        }
      },
      {
        key: "website",
        type: "input",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Website"),
          description: this.translateService.instant("Share your personal website, blog, or social media profiles."),
          placeholder: "https://",
          required: false
        },
        validators: {
          validation: ["url"]
        }
      },
      {
        key: "job",
        type: "input",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Job"),
          description: this.translateService.instant("What do you do professionally?")
        }
      },
      {
        key: "hobbies",
        type: "textarea",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Hobbies"),
          description: this.translateService.instant(
            "What other activities or interests do you enjoy besides astrophotography?"
          ),
          rows: 4
        }
      }
    ];
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  saveChanges(): void {
    if (this.form.valid && this.form.dirty && !this.isLoading) {
      this.isLoading = true;

      const updatedProfile: Partial<UserProfileInterface> = {
        id: this.userProfile.id
      };

      if (this.form.get("about").dirty) {
        updatedProfile.about = this.form.get("about").value;
      }

      if (this.form.get("website").dirty) {
        // Ensure website URL has a protocol before saving
        const websiteValue = this.form.get("website").value;
        updatedProfile.website = websiteValue ? UtilsService.ensureUrlProtocol(websiteValue) : websiteValue;
      }

      if (this.form.get("job").dirty) {
        updatedProfile.job = this.form.get("job").value;
      }

      if (this.form.get("hobbies").dirty) {
        updatedProfile.hobbies = this.form.get("hobbies").value;
      }

      this.store$.dispatch(new UpdateUserProfile(updatedProfile));

      // Listen for the success or failure action
      this.actions$
        .pipe(
          ofType(AuthActionTypes.UPDATE_USER_PROFILE_SUCCESS),
          filter(action => (action as any).payload.id === this.userProfile.id),
          take(1)
        )
        .subscribe(() => {
          this.isLoading = false;
          this.isEditing = false;
        });
    }
  }
}
