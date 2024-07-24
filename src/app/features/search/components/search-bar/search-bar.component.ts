import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { SearchService } from "@features/search/services/search.service";
import { FormControl } from "@angular/forms";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";

enum AutoCompleteType {
  SUBJECT = "subject",
  TELESCOPE = "telescope",
  CAMERA = "camera"
}

interface AutoCompleteItem {
  type: AutoCompleteType;
  value: string;
  label: string;
}

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
  autoCompleteItems: AutoCompleteItem[] = [];

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

    });
  }

  onSearch(model: SearchModelInterface): void {
    this.modelChanged.emit(model);
  }

  onAutoCompleteItemClicked(item: AutoCompleteItem): void {
  }
}
