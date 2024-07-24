import { Component, ElementRef, EventEmitter, OnInit, Output, QueryList, ViewChildren } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { SearchAutoCompleteItem, SearchService } from "@features/search/services/search.service";
import { FormControl } from "@angular/forms";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { forkJoin } from "rxjs";

@Component({
  selector: "astrobin-search-bar",
  templateUrl: "./search-bar.component.html",
  styleUrls: ["./search-bar.component.scss"]
})
export class SearchBarComponent extends BaseComponentDirective implements OnInit {
  model: SearchModelInterface = {
    page: 1
  };
  searchControl = new FormControl();
  autoCompleteItems: SearchAutoCompleteItem[] = [];
  selectedAutoCompleteItemIndex = -1;

  @ViewChildren("autoCompleteItem")
  autoCompleteItemsRefs!: QueryList<ElementRef>;


  @Output()
  modelChanged = new EventEmitter<SearchModelInterface>();

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroyed$)
    ).subscribe(value => {
      this.selectedAutoCompleteItemIndex = -1;

      if (value && value.length > 0) {
        const subjects$ = this.searchService.autoCompleteSubjects$(this.searchControl.value);

        forkJoin([subjects$]).subscribe(([subjects]) => {
          this.autoCompleteItems = subjects;
        });
      } else {
        this.autoCompleteItems = [];
      }
    });
  }

  onSearch(model: SearchModelInterface): void {
    this.modelChanged.emit(model);
  }

  resetAutoCompleteItems(): void {
    this.autoCompleteItems = [];
    this.selectedAutoCompleteItemIndex = -1;
  }

  selectNextAutoCompleteItem(): void {
    if (this.autoCompleteItems.length === 0) {
      return;
    }

    this.selectedAutoCompleteItemIndex = this.selectedAutoCompleteItemIndex === -1
      ? 0
      : (this.selectedAutoCompleteItemIndex + 1) % this.autoCompleteItems.length;

    this.scrollToSelectedItem();
  }

  selectPreviousAutoCompleteItem(): void {
    if (this.autoCompleteItems.length === 0) {
      return;
    }

    this.selectedAutoCompleteItemIndex = this.selectedAutoCompleteItemIndex === -1
      ? this.autoCompleteItems.length - 1
      : (this.selectedAutoCompleteItemIndex - 1 + this.autoCompleteItems.length) % this.autoCompleteItems.length;

    this.scrollToSelectedItem();
  }

  scrollToSelectedItem(): void {
    if (this.selectedAutoCompleteItemIndex !== -1 && this.autoCompleteItemsRefs.length > 0) {
      const selectedItem = this.autoCompleteItemsRefs.toArray()[this.selectedAutoCompleteItemIndex];
      if (selectedItem) {
        selectedItem.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  onAutoCompleteItemClicked(item: SearchAutoCompleteItem): void {
  }
}
