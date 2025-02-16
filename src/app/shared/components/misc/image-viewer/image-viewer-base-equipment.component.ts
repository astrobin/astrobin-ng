import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { SearchService } from "@core/services/search.service";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { WindowRefService } from "@core/services/window-ref.service";
import { MatchType } from "@features/search/enums/match-type.enum";
import { CookieService } from "ngx-cookie";
import { CollapseSyncService } from "@core/services/collapse-sync.service";
import { LegacyEquipmentItem } from "@shared/components/misc/image-viewer/image-viewer-equipment-item.component";


@Component({
  selector: "astrobin-image-viewer-base-equipment",
  template: "",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export abstract class ImageViewerBaseEquipmentComponent extends ImageViewerSectionBaseComponent {
  protected constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly windowRefService: WindowRefService,
    public readonly cookieService: CookieService,
    public readonly collapseSyncService: CollapseSyncService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(
      store$,
      searchService,
      router,
      imageViewerService,
      windowRefService,
      cookieService,
      collapseSyncService,
      changeDetectorRef
    );
  }

  protected equipmentItemClicked(event: MouseEvent, item: EquipmentItem): void {
    event.preventDefault();

    const url = `/equipment/explorer/${item.klass.toLowerCase()}/${item.id}`;

    if (event.ctrlKey || event.metaKey) {
      this.windowRefService.nativeWindow.open(url);
      return;
    }

    this.router.navigateByUrl(url).then(() => {
      this.imageViewerService.closeSlideShow(false);
    });
  }

  protected legacyEquipmentItemClicked(event: MouseEvent, item: LegacyEquipmentItem): void {
    event.preventDefault();

    if (event.ctrlKey || event.metaKey) {
      const url = this.legacyEquipmentUrl(item);
      this.windowRefService.nativeWindow.open(url);
      return;
    }

    this.search({
      text: {
        value: this._legacyItemSearchText(item),
        matchType: MatchType.ALL,
        onlySearchInTitlesAndDescriptions: false
      }
    });
  }

  protected legacyEquipmentUrl(item: LegacyEquipmentItem): string {
    const params = this.searchService.modelToParams({
      text: {
        value: this._legacyItemSearchText(item),
        matchType: MatchType.ALL,
        onlySearchInTitlesAndDescriptions: false
      }
    });
    return `/search?p=${params}`;
  }

  private _legacyItemSearchText(item: LegacyEquipmentItem): string {
    return "\"" + ((item.make || "") + " " + (item.name || "")).trim() + "\"";
  }
}
