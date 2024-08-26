import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { UtilsService } from "@shared/services/utils/utils.service";
import { Actions, ofType } from "@ngrx/effects";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { SearchFilterCategory } from "@features/search/interfaces/search-filter-component.interface";
import { forkJoin, Observable, of } from "rxjs";
import { filter, map, take, tap } from "rxjs/operators";
import { CommonApiService } from "@shared/services/api/classic/common/common-api.service";
import { MatchType } from "@features/search/enums/match-type.enum";
import { AuthActionTypes, LoadUserProfile, LoadUserProfileSuccess } from "@features/account/store/auth.actions";

@Component({
  selector: "astrobin-search-users-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchUsersFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.USERS;

  readonly category = SearchFilterCategory.GENERAL;
  readonly label = this.searchService.humanizeSearchAutoCompleteType(SearchAutoCompleteType.USERS);
  readonly editFields: FormlyFieldConfig[] = [
    {
      key: SearchUsersFilterComponent.key,
      fieldGroup: [
        {
          key: "value",
          type: "ng-select",
          wrappers: ["default-wrapper"],
          expressions: {
            className: () => {
              return this.value?.value?.length <= 1 ? "mb-0" : "";
            }
          },
          props: {
            label: this.label,
            description: this.translateService.instant("Only show images by certain users (including collaborations)."),
            required: false,
            hideOptionalMarker: true,
            multiple: true,
            clearable: true,
            striped: true,
            options: of([]),
            onSearch: (term: string): Observable<UserProfileInterface[]> => {
              const field = this.editFields[0].fieldGroup[0];
              return this.commonApiService.findUserProfiles(term).pipe(
                tap(userProfiles => {
                  field.props = {
                    ...field.props,
                    options: of(userProfiles.map(userProfile => ({
                      value: userProfile.user,
                      label: userProfile.realName ? `${userProfile.realName} (${userProfile.username})` : userProfile.username
                    })))
                  };
                })
              );
            }
          },
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              const value: { id: UserProfileInterface["id"]; name: string }[] = field.formControl.value;
              if (value) {
                const arrayValue = UtilsService.isArray(value) ? value : [value];
                field.props.options = of(arrayValue.map(x => ({
                  value: x.id,
                  label: x.name
                })));
                field.formControl.setValue(value.map(x => x.id), { emitEvent: false });
              }
            }
          }
        },
        this.getMatchTypeField(`${SearchUsersFilterComponent.key}.value`)
      ]
    }
  ];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchService: SearchService,
    public readonly actions$: Actions,
    public readonly commonApiService: CommonApiService
  ) {
    super(
      store$,
      translateService,
      domSanitizer,
      modalService,
      searchService
    );
  }

  valueTransformer: (value: {
    value: (UserProfileInterface["id"] | {
      id: UserProfileInterface["id"];
      name: string
    })[],
    matchType: MatchType
  }) => Observable<{
    value: {
      id: UserProfileInterface["id"];
      name: string
    }[],
    matchType: MatchType
  }> = value => {
    const userProfileIds: UserProfileInterface["id"][] = [];
    value.value.forEach((value: any) => {
      if (typeof value === "object") {
        userProfileIds.push(value.id);
      } else {
        userProfileIds.push(value);
      }
    });

    return new Observable<{
      value: {
        id: UserProfileInterface["id"];
        name: string
      }[],
      matchType: MatchType
    }>(observer => {
      const observables$ = userProfileIds.map((id: UserProfileInterface["id"]) =>
        this.actions$.pipe(
          ofType(AuthActionTypes.LOAD_USER_PROFILE_SUCCESS),
          map((action: LoadUserProfileSuccess) => action.payload.userProfile),
          filter((userProfile: UserProfileInterface) => userProfile.id === id),
          take(1)
        )
      );

      forkJoin(observables$).pipe(take(1)).subscribe((userProfiles: UserProfileInterface[]) => {
        const newValue = {
          value: userProfiles.map(userProfile => ({
            id: userProfile.id,
            name: userProfile.realName || userProfile.username
          })),
          matchType: value.matchType
        };
        observer.next(newValue);
        observer.complete();
      });

      userProfileIds.forEach((id: UserProfileInterface["id"]) => {
        this.store$.dispatch(new LoadUserProfile({ id }));
      });
    });
  };

  render(): SafeHtml {
    if (!this.value) {
      return this.domSanitizer.bypassSecurityTrustHtml("...");
    }

    if (this.value.value.length === 0) {
      return this.domSanitizer.bypassSecurityTrustHtml("...");
    }

    if (this.value.value?.length === 1) {
      return this.domSanitizer.bypassSecurityTrustHtml(
        this.value?.value[0].name || "..."
      );
    }

    const names = this.value.value.map((value: { id: UserProfileInterface["id"]; name: string }) => value.name);
    return this.domSanitizer.bypassSecurityTrustHtml(
      names.map((name: string) => name || "...").join(", ")
    );
  }
}
