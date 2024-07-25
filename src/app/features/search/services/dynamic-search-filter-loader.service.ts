import { Injectable, Type, ViewContainerRef } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";

@Injectable({
  providedIn: "root"
})
export class DynamicSearchFilterLoaderService {
  loadComponent(
    viewContainerRef: ViewContainerRef,
    component: Type<SearchBaseFilterComponent>,
    label: string,
    value: any
  ) {
    const componentRef = viewContainerRef.createComponent(component);
    componentRef.instance.label = label;
    componentRef.instance.value = value;
    return componentRef;
  }
}
