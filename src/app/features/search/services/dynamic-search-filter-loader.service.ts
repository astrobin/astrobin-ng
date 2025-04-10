import { Type, ViewContainerRef, Injectable } from "@angular/core";
import { SearchFilterComponentInterface } from "@core/interfaces/search-filter-component.interface";

@Injectable({
  providedIn: "root"
})
export class DynamicSearchFilterLoaderService {
  loadComponent(component: Type<SearchFilterComponentInterface>, value: any, viewContainerRef: ViewContainerRef) {
    const componentRef = viewContainerRef.createComponent(component);
    componentRef.instance.value = value;
    return componentRef;
  }
}
