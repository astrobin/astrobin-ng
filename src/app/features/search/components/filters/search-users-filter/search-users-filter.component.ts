import { Component } from "@angular/core";
import type { SafeHtml } from "@angular/platform-browser";
import { DomSanitizer } from "@angular/platform-browser";
import type { MainState } from "@app/store/state";
import { SearchFilterCategory } from "@core/interfaces/search-filter-component.interface";
import type { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import { CommonApiService } from "@core/services/api/classic/common/common-api.service";
import { UtilsService } from "@core/services/utils/utils.service";
import type { LoadUserSuccess } from "@features/account/store/auth.actions";
import { AuthActionTypes, LoadUser } from "@features/account/store/auth.actions";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import type { MatchType } from "@features/search/enums/match-type.enum";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, Observable, of } from "rxjs";
import { filter, map, take, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-search-users-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchUsersFilterComponent extends SearchBaseFilterComponent {
  static key = SearchAutoCompleteType.USERS;

  readonly category = SearchFilterCategory.GENERAL;
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(SearchAutoCompleteType.USERS);
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
                    options: of(
                      userProfiles.map(userProfile => ({
                        value: userProfile.user,
                        label: userProfile.realName
                          ? `${userProfile.realName} (${userProfile.username})`
                          : userProfile.username
                      }))
                    )
                  };
                })
              );
            }
          },
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              const value: { id: UserInterface["id"]; name: string }[] = field.formControl.value;
              if (value) {
                const arrayValue = UtilsService.isArray(value) ? value : [value];
                field.props.options = of(
                  arrayValue.map(x => ({
                    value: x.id,
                    label: x.name
                  }))
                );
                field.formControl.setValue(
                  value.map(x => x.id),
                  { emitEvent: false }
                );
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
    public readonly searchFilterService: SearchFilterService,
    public readonly actions$: Actions,
    public readonly commonApiService: CommonApiService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService);
  }

  readonly valueTransformer: (value: {
    value: (
      | UserInterface["id"]
      | {
          id: UserInterface["id"];
          name: string;
        }
    )[];
    matchType: MatchType;
  }) => Observable<{
    value: {
      id: UserInterface["id"];
      name: string;
    }[];
    matchType: MatchType;
  }> = value => {
    const userIds: UserInterface["id"][] = [];
    value.value.forEach((userId: any) => {
      if (typeof userId === "object") {
        userIds.push(userId.id);
      } else {
        userIds.push(userId);
      }
    });

    return new Observable<{
      value: {
        id: UserInterface["id"];
        name: string;
      }[];
      matchType: MatchType;
    }>(observer => {
      const observables$ = userIds.map((id: UserInterface["id"]) =>
        this.actions$.pipe(
          ofType(AuthActionTypes.LOAD_USER_SUCCESS),
          map((action: LoadUserSuccess) => action.payload.user),
          filter((user: UserInterface) => user.id === id),
          take(1)
        )
      );

      forkJoin(observables$)
        .pipe(take(1))
        .subscribe((users: UserInterface[]) => {
          const newValue = {
            value: users.map(user => ({
              id: user.id,
              name: user.displayName === user.username ? user.username : `${user.displayName} (${user.username})`
            })),
            matchType: value.matchType
          };
          observer.next(newValue);
          observer.complete();
        });

      userIds.forEach((id: UserInterface["id"]) => {
        this.store$.dispatch(new LoadUser({ id }));
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
      return this.domSanitizer.bypassSecurityTrustHtml(this.value?.value[0].name || "...");
    }

    const names = this.value.value.map((value: { id: UserInterface["id"]; name: string }) => value.name);
    return this.domSanitizer.bypassSecurityTrustHtml(names.map((name: string) => name || "...").join(", "));
  }
}
