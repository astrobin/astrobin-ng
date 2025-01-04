import { Component, OnInit } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { GroupApiService } from "@shared/services/api/classic/groups/group-api.service";
import { takeUntil, tap } from "rxjs/operators";
import { GroupInterface } from "@shared/interfaces/group.interface";
import { SearchFilterCategory } from "@features/search/interfaces/search-filter-component.interface";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";

@Component({
  selector: "astrobin-search-groups-filter.search-filter-component",
  templateUrl: "../search-base-filter/search-base-filter.component.html",
  styleUrls: ["../search-base-filter/search-base-filter.component.scss"]
})
export class SearchGroupsFilterComponent extends SearchBaseFilterComponent implements OnInit {
  static key = SearchAutoCompleteType.GROUPS;

  readonly category = SearchFilterCategory.GENERAL;
  readonly label = this.searchFilterService.humanizeSearchAutoCompleteType(SearchGroupsFilterComponent.key);
  readonly editFields = [
    {
      key: SearchGroupsFilterComponent.key,
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
            searchable: false,
            closeOnSelect: true,
            required: true,
            multiple: true,
            label: this.label,
            description: this.translateService.instant(
              "Only show images that appear in specific groups that you are a member of."
            ),
            options: []
          }
        },
        this.getMatchTypeField(`${SearchGroupsFilterComponent.key}.value`)
      ]
    }
  ];

  groups: GroupInterface[] = [];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchFilterService: SearchFilterService,
    public readonly groupApiService: GroupApiService
  ) {
    super(store$, translateService, domSanitizer, modalService, searchFilterService);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.currentUser$.pipe(takeUntil(this.destroyed$)).subscribe(user => {
      if (user) {
        this.groupApiService.getAll(user.id).pipe(
          tap(groups => {
            this.groups = groups;
          })
        ).subscribe(groups => {
          const field = this.editFields[0].fieldGroup[0];
          field.props.options = groups.map(group => ({
            value: group.id,
            label: group.name
          }));
        });
      }
    });
  }

  render(): SafeHtml {
    if (!this.value) {
      return "";
    }

    const getGroupName = (id: GroupInterface["id"]): string => {
      return this.groups.find(group => group.id === id)?.name;
    };

    if (this.value.value.length === 1) {
      return this.domSanitizer.bypassSecurityTrustHtml(getGroupName(this.value.value[0]));
    }

    return this.domSanitizer.bypassSecurityTrustHtml(
      this.value.value.map((id: GroupInterface["id"]) => getGroupName(id)).join(", ")
    );
  }
}
