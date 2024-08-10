import { Component, EventEmitter, HostListener, Input, OnInit, Output } from "@angular/core";
import { Location } from "@angular/common";
import { FINAL_REVISION_LABEL, ImageInterface, SubjectType } from "@shared/interfaces/image.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { select, Store } from "@ngrx/store";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { DeviceService } from "@shared/services/device.service";
import { LoadImage } from "@app/store/actions/image.actions";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { filter, take } from "rxjs/operators";
import { ImageService } from "@shared/services/image/image.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { SolutionService } from "@shared/services/solution/solution.service";

@Component({
  selector: "astrobin-image-viewer",
  templateUrl: "./image-viewer.component.html",
  styleUrls: ["./image-viewer.component.scss"]
})
export class ImageViewerComponent extends BaseComponentDirective implements OnInit {
  readonly ImageAlias = ImageAlias;

  loading = false;
  alias: ImageAlias;
  hasOtherImages = false;
  currentIndex = null;

  subjectTypeIcon: string = null;
  subjectType: string = null;
  hemisphere: string = null;
  constellation: string = null;
  integration: string = null;
  bortleScale: number = null;
  publicationDate: string = null;
  coordinates: string = null;
  equipmentItems: EquipmentItem[] = null;
  objectsInField: string[] = null;

  @Input()
  image: ImageInterface;

  @Input()
  navigationContext: (ImageInterface["hash"] | ImageInterface["pk"])[];

  @Output()
  closeViewer = new EventEmitter<void>();

  @Output()
  initialized = new EventEmitter<void>();

  constructor(
    public readonly store$: Store<MainState>,
    public readonly deviceService: DeviceService,
    public readonly imageService: ImageService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly searchService: SearchService,
    public readonly location: Location,
    public readonly router: Router,
    public readonly solutionService: SolutionService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    if (this.deviceService.lgMax()) {
      this.alias = ImageAlias.HD;
    } else if (this.deviceService.xlMin()) {
      this.alias = ImageAlias.QHD;
    }

    this.initialized.emit();
  }

  @HostListener("document:keydown.escape", ["$event"])
  handleEscapeKey(event: KeyboardEvent) {
    this.close();
  }

  updateImageInformation(): void {
    // TODO: if looking at a revision...

    this.subjectTypeIcon = this.imageService.getSubjectTypeIcon(
      this.image.subjectType,
      this.image.solarSystemMainSubject,
      "white"
    );

    if (this.image.subjectType === SubjectType.SOLAR_SYSTEM && this.image.solarSystemMainSubject) {
      this.subjectType = this.imageService.humanizeSolarSystemSubjectType(this.image.solarSystemMainSubject);
    } else {
      this.subjectType = this.imageService.humanizeSubjectTypeShort(this.image.subjectType);
    }

    this.hemisphere = this.imageService.getCelestialHemisphere(this.image, FINAL_REVISION_LABEL);
    this.constellation = this.imageService.getConstellation(this.image, FINAL_REVISION_LABEL);
    this.integration = this.imageService.getIntegration(this.image);
    this.bortleScale = this.imageService.getAverageBortleScale(this.image);
    this.publicationDate = this.imageService.getPublicationDate(this.image);
    this.coordinates = this.imageService.getCoordinates(this.image, FINAL_REVISION_LABEL);
    this.equipmentItems = [
      ...this.image.imagingTelescopes2,
      ...this.image.imagingCameras2,
      ...this.image.mounts2,
      ...this.image.filters2,
      ...this.image.accessories2,
      ...this.image.software2
    ];
    this.objectsInField = this.solutionService.getObjectsInField(
      this.imageService.getFinalRevision(this.image).solution
    );
  }

  updateNavigationContextInformation(): void {
    this.hasOtherImages = this.navigationContext.filter(id => id !== this.image.hash && id !== this.image.pk).length > 0;
    this.updateCurrentImageIndexInNavigationContext();
    this.loadNextImages(5);
    this.loadPreviousImages(5);
  }

  updateCurrentImageIndexInNavigationContext(): void {
    const byHash = this.navigationContext.indexOf(this.image.hash);
    const byPk = this.navigationContext.indexOf(this.image.pk);

    this.currentIndex = byHash !== -1 ? byHash : byPk;
  }

  loadNextImages(n: number): void {
    for (let i = 1; i <= n; i++) {
      const nextIndex = this.currentIndex + i;
      if (nextIndex < this.navigationContext.length) {
        this.store$.dispatch(new LoadImage({ imageId: this.navigationContext[nextIndex] }));
      }
    }
  }

  loadPreviousImages(n: number): void {
    for (let i = 1; i <= n; i++) {
      const previousIndex = this.currentIndex - i;
      if (previousIndex >= 0) {
        this.store$.dispatch(new LoadImage({ imageId: this.navigationContext[previousIndex] }));
      }
    }
  }

  @HostListener("document:keydown.arrowRight", ["$event"])
  onNextClicked(): void {
    if (this.currentIndex < this.navigationContext.length - 1) {
      this.store$.pipe(
        select(selectImage, this.navigationContext[this.currentIndex + 1]),
        filter(image => !!image),
        take(1)
      ).subscribe(image => {
        this.image = image;
        this.updateNavigationContextInformation();
        this.updateImageInformation();
      });
    }
  }

  @HostListener("document:keydown.arrowLeft", ["$event"])
  onPreviousClicked(): void {
    if (this.currentIndex > 0) {
      this.store$.pipe(
        select(selectImage, this.navigationContext[this.currentIndex - 1]),
        filter(image => !!image),
        take(1)
      ).subscribe(image => {
        this.image = image;
        this.updateNavigationContextInformation();
        this.updateImageInformation();
      });
    }
  }

  constellationClicked(event: MouseEvent): void {
    event.preventDefault();

    const params = this.searchService.modelToParams({ constellation: this.constellation });
    this.router.navigateByUrl(`/search?p=${params}`).then(() => {
      this.close();
    });
  }

  objectInFieldClicked(event: MouseEvent, name: string): void {
    event.preventDefault();

    const params = this.searchService.modelToParams({ subject: name });
    this.router.navigateByUrl(`/search?p=${params}`).then(() => {
      this.close();
    });
  }

  close(): void {
    this.closeViewer.emit();
  }
}
