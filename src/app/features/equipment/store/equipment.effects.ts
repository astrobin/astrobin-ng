import { Injectable } from "@angular/core";
import type { All } from "@app/store/actions/app.actions";
import type { MainState } from "@app/store/state";
import { EquipmentMarketplaceService } from "@core/services/equipment-marketplace.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import {
  AcceptMarketplaceOfferFailure,
  AcceptMarketplaceOfferSuccess,
  ApproveEquipmentItemEditProposalSuccess,
  ApproveEquipmentItemSuccess,
  ApproveMarketplaceListingFailure,
  ApproveMarketplaceListingSuccess,
  AssignEditProposalSuccess,
  AssignItemSuccess,
  CreateAccessoryEditProposalSuccess,
  CreateAccessorySuccess,
  CreateBrandSuccess,
  CreateCameraEditProposalSuccess,
  CreateCameraSuccess,
  CreateEquipmentPresetSuccess,
  CreateFilterEditProposalSuccess,
  CreateFilterSuccess,
  CreateMarketplaceFeedbackFailure,
  CreateMarketplaceFeedbackSuccess,
  CreateMarketplaceListingFailure,
  CreateMarketplaceListingSuccess,
  CreateMarketplaceOfferFailure,
  CreateMarketplaceOfferSuccess,
  CreateMarketplacePrivateConversationFailure,
  CreateMarketplacePrivateConversationSuccess,
  CreateMountEditProposalSuccess,
  CreateMountSuccess,
  CreateSensorEditProposalSuccess,
  CreateSensorSuccess,
  CreateSoftwareEditProposalSuccess,
  CreateSoftwareSuccess,
  CreateTelescopeEditProposalSuccess,
  CreateTelescopeSuccess,
  DeleteEquipmentPresetSuccess,
  DeleteMarketplaceListingFailure,
  DeleteMarketplaceListingSuccess,
  DeleteMarketplacePrivateConversationFailure,
  DeleteMarketplacePrivateConversationSuccess,
  EquipmentActionTypes,
  FindAllBrandsSuccess,
  FindAllEquipmentItemsSuccess,
  FindCameraVariantsSuccess,
  FindEquipmentItemEditProposalsSuccess,
  FindEquipmentPresetsFailure,
  FindEquipmentPresetsSuccess,
  FindRecentlyUsedEquipmentItemsSuccess,
  FindSimilarInBrandSuccess,
  FreezeEquipmentItemAsAmbiguousSuccess,
  GetAllBrandsSuccess,
  GetAllInBrandSuccess,
  GetContributorsSuccess,
  GetMarketplaceFeedbackFailure,
  GetMarketplaceFeedbackSuccess,
  GetMostOftenUsedWithSuccess,
  GetOthersInBrandSuccess,
  LoadBrandSuccess,
  LoadEquipmentItemFailure,
  LoadEquipmentItemSuccess,
  LoadMarketplaceListingFailure,
  LoadMarketplaceListingsSuccess,
  LoadMarketplaceListingSuccess,
  LoadMarketplacePrivateConversationsFailure,
  LoadMarketplacePrivateConversationsSuccess,
  LoadSensorSuccess,
  MarkMarketplaceLineItemAsSoldFailure,
  MarkMarketplaceLineItemAsSoldSuccess,
  RejectEquipmentItemEditProposalSuccess,
  RejectEquipmentItemSuccess,
  RejectMarketplaceOfferFailure,
  RejectMarketplaceOfferSuccess,
  RenewMarketplaceListingFailure,
  RenewMarketplaceListingSuccess,
  RetractMarketplaceOfferFailure,
  RetractMarketplaceOfferSuccess,
  UnapproveEquipmentItemSuccess,
  UnfreezeEquipmentItemAsAmbiguousSuccess,
  UpdateEquipmentPresetFailure,
  UpdateEquipmentPresetSuccess,
  UpdateMarketplaceListingFailure,
  UpdateMarketplaceListingSuccess,
  UpdateMarketplaceOfferFailure,
  UpdateMarketplaceOfferSuccess,
  UpdateMarketplacePrivateConversationFailure,
  UpdateMarketplacePrivateConversationSuccess
} from "@features/equipment/store/equipment.actions";
import type {
  AcceptMarketplaceOffer,
  ApproveEquipmentItem,
  ApproveEquipmentItemEditProposal,
  ApproveMarketplaceListing,
  AssignEditProposal,
  AssignItem,
  CreateAccessory,
  CreateAccessoryEditProposal,
  CreateBrand,
  CreateCamera,
  CreateCameraEditProposal,
  CreateEquipmentPreset,
  CreateFilter,
  CreateFilterEditProposal,
  CreateMarketplaceFeedback,
  CreateMarketplaceListing,
  CreateMarketplaceOffer,
  CreateMarketplacePrivateConversation,
  CreateMount,
  CreateMountEditProposal,
  CreateSensor,
  CreateSensorEditProposal,
  CreateSoftware,
  CreateSoftwareEditProposal,
  CreateTelescope,
  CreateTelescopeEditProposal,
  DeleteEquipmentPreset,
  DeleteMarketplaceListing,
  DeleteMarketplacePrivateConversation,
  FindAllBrands,
  FindAllEquipmentItems,
  FindCameraVariants,
  FindEquipmentItemEditProposals,
  FindEquipmentPresets,
  FindRecentlyUsedEquipmentItems,
  FindSimilarInBrand,
  FreezeEquipmentItemAsAmbiguous,
  GetAllBrands,
  GetAllInBrand,
  GetMarketplaceFeedback,
  GetMostOftenUsedWith,
  GetOthersInBrand,
  LoadBrand,
  LoadEquipmentItem,
  LoadMarketplaceListing,
  LoadMarketplaceListings,
  LoadMarketplacePrivateConversations,
  LoadSensor,
  MarkMarketplaceLineItemAsSold,
  RejectEquipmentItem,
  RejectEquipmentItemEditProposal,
  RejectMarketplaceOffer,
  RenewMarketplaceListing,
  RetractMarketplaceOffer,
  UnapproveEquipmentItem,
  UnfreezeEquipmentItemAsAmbiguous,
  UpdateEquipmentPreset,
  UpdateMarketplaceListing,
  UpdateMarketplaceOffer,
  UpdateMarketplacePrivateConversation
} from "@features/equipment/store/equipment.actions";
import {
  selectBrand,
  selectEquipmentItem,
  selectMarketplaceListing
} from "@features/equipment/store/equipment.selectors";
import type { BrandInterface } from "@features/equipment/types/brand.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import type { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import type { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import type { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import type { SensorInterface } from "@features/equipment/types/sensor.interface";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import type { SelectorWithProps } from "@ngrx/store/src/models";
import { TranslateService } from "@ngx-translate/core";
import { LocalDatePipe } from "@shared/pipes/local-date.pipe";
import { concat, finalize, forkJoin, last, of } from "rxjs";
import type { Observable } from "rxjs";
import { catchError, filter, map, mergeMap, switchMap, tap } from "rxjs/operators";

function getFromStoreOrApiByIdAndType<T>(
  store$: Store<MainState>,
  id: number,
  type: EquipmentItemType,
  allowUnapproved: boolean,
  allowDIY: boolean,
  selector: SelectorWithProps<any, { id: number; type: EquipmentItemType }, T>,
  apiCall: (id: number, type: EquipmentItemType, allowUnapproved: boolean, allowDIY: boolean) => Observable<T>,
  apiContext: any
): Observable<T> {
  const fromApi: Observable<T> = apiCall.apply(apiContext, [id, type, allowUnapproved, allowDIY]);
  return store$
    .select(selector, { id, type })
    .pipe(switchMap(fromStore => (fromStore !== null ? of(fromStore) : fromApi)));
}

@Injectable()
export class EquipmentEffects {
  localDatePipe: LocalDatePipe;

  /*********************************************************************************************************************
   * Brands
   ********************************************************************************************************************/

  GetAllBrands: Observable<GetAllBrandsSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.GET_ALL_BRANDS),
      map((action: GetAllBrands) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .getAllBrands(payload.page, payload.sort)
          .pipe(map(response => new GetAllBrandsSuccess({ response, sort: payload.sort })))
      )
    )
  );

  LoadBrand: Observable<LoadBrandSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.LOAD_BRAND),
      map((action: LoadBrand) => action.payload.id),
      mergeMap(id => {
        if (!id) {
          return of(null);
        }

        return this.utilsService
          .getFromStoreOrApiById<BrandInterface>(
            this.store$,
            id,
            selectBrand,
            this.equipmentApiService.getBrand,
            this.equipmentApiService
          )
          .pipe(
            filter(brand => !!brand),
            map(brand => new LoadBrandSuccess({ brand }))
          );
      })
    )
  );

  CreateBrand: Observable<CreateBrandSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_BRAND),
      map((action: CreateBrand) => action.payload.brand),
      mergeMap(brand =>
        this.equipmentApiService
          .createBrand(brand)
          .pipe(map(createdBrand => new CreateBrandSuccess({ brand: createdBrand })))
      )
    )
  );

  FindAllBrands: Observable<FindAllBrandsSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_ALL_BRANDS),
      map((action: FindAllBrands) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService.findAllBrands(payload.q).pipe(map(brands => new FindAllBrandsSuccess({ brands })))
      )
    )
  );

  /*********************************************************************************************************************
   * Generic equipment items
   ********************************************************************************************************************/

  LoadEquipmentItem: Observable<LoadEquipmentItemSuccess | LoadEquipmentItemFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.LOAD_EQUIPMENT_ITEM),
      map((action: LoadEquipmentItem) => action.payload),
      mergeMap(payload => {
        if (!!payload.item) {
          return of(new LoadEquipmentItemSuccess({ item: payload.item }));
        }

        if (!payload.id || !payload.type) {
          return of(new LoadEquipmentItemFailure({ id: payload.id, klass: payload.type }));
        }

        return getFromStoreOrApiByIdAndType<EquipmentItemBaseInterface>(
          this.store$,
          payload.id,
          payload.type,
          payload.allowUnapproved,
          payload.allowDIY,
          selectEquipmentItem,
          this.equipmentApiService.getEquipmentItem,
          this.equipmentApiService
        ).pipe(
          map(item => new LoadEquipmentItemSuccess({ item })),
          catchError(() => of(new LoadEquipmentItemFailure({ id: payload.id, klass: payload.type })))
        );
      })
    )
  );

  FindAllEquipmentItems: Observable<FindAllEquipmentItemsSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_ALL_EQUIPMENT_ITEMS),
      map((action: FindAllEquipmentItems) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .findAllEquipmentItems(payload.type, payload.options)
          .pipe(map(response => new FindAllEquipmentItemsSuccess({ items: response.results })))
      )
    )
  );

  FindRecentlyUsedEquipmentItems: Observable<FindRecentlyUsedEquipmentItemsSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_RECENTLY_USED_EQUIPMENT_ITEMS),
      map((action: FindRecentlyUsedEquipmentItems) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .findRecentlyUsedEquipmentItems(
            payload.type,
            payload.usageType,
            payload.includeFrozen,
            payload.query,
            payload.userId
          )
          .pipe(
            map(
              items =>
                new FindRecentlyUsedEquipmentItemsSuccess({
                  type: payload.type,
                  usageType: payload.usageType,
                  userId: payload.userId,
                  items
                })
            )
          )
      )
    )
  );

  FindSimilarInBrand: Observable<FindSimilarInBrandSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_SIMILAR_IN_BRAND),
      map((action: FindSimilarInBrand) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .findSimilarInBrand(payload.brand, payload.q, payload.type)
          .pipe(map(items => new FindSimilarInBrandSuccess({ items })))
      )
    )
  );

  GetAllInBrand: Observable<GetAllInBrandSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.GET_ALL_IN_BRAND),
      map((action: GetAllInBrand) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .getAllInBrand(payload.brand, payload.type, payload.page)
          .pipe(map(response => new GetAllInBrandSuccess({ response })))
      )
    )
  );

  GetOthersInBrand: Observable<GetOthersInBrandSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.GET_OTHERS_IN_BRAND),
      map((action: GetOthersInBrand) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .getOthersInBrand(payload.brand, payload.type, payload.name)
          .pipe(map(items => new GetOthersInBrandSuccess({ items })))
      )
    )
  );

  ApproveEquipmentItem: Observable<ApproveEquipmentItemSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM),
      map((action: ApproveEquipmentItem) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .approveEquipmentItem(payload.item, payload.comment)
          .pipe(map(item => new ApproveEquipmentItemSuccess({ item })))
      )
    )
  );

  UnapproveEquipmentItem: Observable<UnapproveEquipmentItemSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.UNAPPROVE_EQUIPMENT_ITEM),
      map((action: UnapproveEquipmentItem) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .unapproveEquipmentItem(payload.item)
          .pipe(map(item => new UnapproveEquipmentItemSuccess({ item })))
      )
    )
  );

  FreezeEquipmentItemAsAmbiguous: Observable<FreezeEquipmentItemAsAmbiguousSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.FREEZE_EQUIPMENT_ITEM_AS_AMBIGUOUS),
      map((action: FreezeEquipmentItemAsAmbiguous) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .freezeEquipmentItemAsAmbiguous(payload.item)
          .pipe(map(item => new FreezeEquipmentItemAsAmbiguousSuccess({ item })))
      )
    )
  );

  UnfreezeEquipmentItemAsAmbiguous: Observable<UnfreezeEquipmentItemAsAmbiguousSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.UNFREEZE_EQUIPMENT_ITEM_AS_AMBIGUOUS),
      map((action: UnfreezeEquipmentItemAsAmbiguous) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .unfreezeEquipmentItemAsAmbiguous(payload.item)
          .pipe(map(item => new UnfreezeEquipmentItemAsAmbiguousSuccess({ item })))
      )
    )
  );

  RejectEquipmentItem: Observable<RejectEquipmentItemSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.REJECT_EQUIPMENT_ITEM),
      map((action: RejectEquipmentItem) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .rejectEquipmentItem(
            payload.item,
            payload.reason,
            payload.comment,
            payload.duplicateOf,
            payload.duplicateOfKlass,
            payload.duplicateOfUsageType
          )
          .pipe(map(item => new RejectEquipmentItemSuccess({ item })))
      )
    )
  );

  FindEquipmentItemEditProposals: Observable<FindEquipmentItemEditProposalsSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_EQUIPMENT_ITEM_EDIT_PROPOSALS),
      map((action: FindEquipmentItemEditProposals) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .getEditProposals(payload.item)
          .pipe(map(editProposals => new FindEquipmentItemEditProposalsSuccess({ editProposals })))
      )
    )
  );

  ApproveEquipmentItemEditProposal: Observable<ApproveEquipmentItemEditProposalSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_EDIT_PROPOSAL),
      map((action: ApproveEquipmentItemEditProposal) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .approveEditProposal(payload.editProposal, payload.comment)
          .pipe(
            map(
              approvedEditProposal =>
                new ApproveEquipmentItemEditProposalSuccess({ editProposal: approvedEditProposal })
            )
          )
      )
    )
  );

  RejectEquipmentItemEditProposal: Observable<RejectEquipmentItemEditProposalSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_EDIT_PROPOSAL),
      map((action: RejectEquipmentItemEditProposal) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .rejectEditProposal(payload.editProposal, payload.comment)
          .pipe(
            map(
              rejectedEditProposal => new RejectEquipmentItemEditProposalSuccess({ editProposal: rejectedEditProposal })
            )
          )
      )
    )
  );

  GetMostOftenUsedWith: Observable<GetMostOftenUsedWithSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.GET_MOST_OFTEN_USED_WITH),
      map((action: GetMostOftenUsedWith) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .getMostOftenUsedWith(payload.itemType, payload.itemId)
          .pipe(
            map(data => new GetMostOftenUsedWithSuccess({ itemType: payload.itemType, itemId: payload.itemId, data }))
          )
      )
    )
  );

  GetContributors: Observable<GetContributorsSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.GET_CONTRIBUTORS),
      mergeMap(() =>
        this.equipmentApiService
          .getContributors()
          .pipe(map(contributors => new GetContributorsSuccess({ contributors })))
      )
    )
  );

  AssignItem: Observable<AssignItemSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.ASSIGN_ITEM),
      map((action: AssignItem) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .assignItem(payload.itemType, payload.itemId, payload.assignee)
          .pipe(map(item => new AssignItemSuccess({ item })))
      )
    )
  );

  AssignEditProposal: Observable<AssignEditProposalSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.ASSIGN_EDIT_PROPOSAL),
      map((action: AssignEditProposal) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .assignEditProposal(payload.itemType, payload.editProposalId, payload.assignee)
          .pipe(map(editProposal => new AssignEditProposalSuccess({ editProposal })))
      )
    )
  );

  /*********************************************************************************************************************
   * Equipment presets
   ********************************************************************************************************************/

  FindEquipmentPresets: Observable<FindEquipmentPresetsSuccess | FindEquipmentPresetsFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_EQUIPMENT_PRESETS),
      map((action: FindEquipmentPresets) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService.findEquipmentPresets(payload.userId).pipe(
          map(presets => new FindEquipmentPresetsSuccess({ userId: payload.userId, presets })),
          catchError(error => of(new FindEquipmentPresetsFailure({ userId: payload.userId, error })))
        )
      )
    )
  );

  CreateEquipmentPreset: Observable<CreateEquipmentPresetSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_EQUIPMENT_PRESET),
      map((action: CreateEquipmentPreset) => action.payload.preset),
      mergeMap(preset =>
        this.equipmentApiService.createEquipmentPreset(preset).pipe(
          map(savedPreset => new CreateEquipmentPresetSuccess({ preset: savedPreset })),
          catchError(() => of(new CreateEquipmentPresetSuccess({ preset })))
        )
      )
    )
  );

  UpdateEquipmentPreset: Observable<UpdateEquipmentPresetSuccess | UpdateEquipmentPresetFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.UPDATE_EQUIPMENT_PRESET),
      map((action: UpdateEquipmentPreset) => action.payload.preset),
      mergeMap(preset =>
        this.equipmentApiService.updateEquipmentPreset(preset).pipe(
          map(updatedPreset => new UpdateEquipmentPresetSuccess({ preset: updatedPreset })),
          catchError(error => of(new UpdateEquipmentPresetFailure({ preset, error })))
        )
      )
    )
  );

  DeleteEquipmentPreset: Observable<DeleteEquipmentPresetSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.DELETE_EQUIPMENT_PRESET),
      map((action: DeleteEquipmentPreset) => action.payload.id),
      mergeMap(id =>
        this.equipmentApiService.deleteEquipmentPreset(id).pipe(map(() => new DeleteEquipmentPresetSuccess({ id })))
      )
    )
  );

  /*********************************************************************************************************************
   * Sensors
   ********************************************************************************************************************/

  LoadSensor: Observable<LoadSensorSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.LOAD_SENSOR),
      map((action: LoadSensor) => action.payload.id),
      mergeMap(id =>
        getFromStoreOrApiByIdAndType<SensorInterface>(
          this.store$,
          id,
          EquipmentItemType.SENSOR,
          false,
          false,
          selectEquipmentItem as SelectorWithProps<any, { id: number; type: EquipmentItemType }, SensorInterface>,
          this.equipmentApiService.getSensor,
          this.equipmentApiService
        ).pipe(map(sensor => new LoadSensorSuccess({ item: sensor as SensorInterface })))
      )
    )
  );

  CreateSensor: Observable<CreateSensorSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_SENSOR),
      map((action: CreateSensor) => action.payload.sensor),
      mergeMap(sensor =>
        this.equipmentApiService
          .createSensor(sensor)
          .pipe(map(createdSensor => new CreateSensorSuccess({ item: createdSensor })))
      )
    )
  );

  CreateSensorEditProposal: Observable<CreateSensorEditProposalSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_SENSOR_EDIT_PROPOSAL),
      map((action: CreateSensorEditProposal) => action.payload.sensor),
      mergeMap(sensor =>
        this.equipmentApiService
          .createSensorEditProposal(sensor)
          .pipe(
            map(
              createdSensorEditProposal =>
                new CreateSensorEditProposalSuccess({ editProposal: createdSensorEditProposal })
            )
          )
      )
    )
  );

  /*********************************************************************************************************************
   * Cameras
   ********************************************************************************************************************/

  CreateCamera: Observable<CreateCameraSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_CAMERA),
      map((action: CreateCamera) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .createCamera(payload.camera)
          .pipe(map(createdCamera => new CreateCameraSuccess({ item: createdCamera })))
      )
    )
  );

  CreateCameraEditProposal: Observable<CreateCameraEditProposalSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_CAMERA_EDIT_PROPOSAL),
      map((action: CreateCameraEditProposal) => action.payload.camera),
      mergeMap(camera =>
        this.equipmentApiService
          .createCameraEditProposal(camera)
          .pipe(
            map(
              createdCameraEditProposal =>
                new CreateCameraEditProposalSuccess({ editProposal: createdCameraEditProposal })
            )
          )
      )
    )
  );

  FindCameraVariants: Observable<FindCameraVariantsSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_CAMERA_VARIANTS),
      map((action: FindCameraVariants) => action.payload.id),
      mergeMap(id =>
        this.equipmentApiService
          .findCameraVariants(id)
          .pipe(map(cameraVariants => new FindCameraVariantsSuccess({ cameraVariants })))
      )
    )
  );

  /*********************************************************************************************************************
   * Telescopes
   ********************************************************************************************************************/

  CreateTelescope: Observable<CreateTelescopeSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_TELESCOPE),
      map((action: CreateTelescope) => action.payload.telescope),
      mergeMap(telescope =>
        this.equipmentApiService
          .createTelescope(telescope)
          .pipe(map(createdTelescope => new CreateTelescopeSuccess({ item: createdTelescope })))
      )
    )
  );

  CreateTelescopeEditProposal: Observable<CreateTelescopeEditProposalSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_TELESCOPE_EDIT_PROPOSAL),
      map((action: CreateTelescopeEditProposal) => action.payload.telescope),
      mergeMap(telescope =>
        this.equipmentApiService
          .createTelescopeEditProposal(telescope)
          .pipe(
            map(
              createdTelescopeEditProposal =>
                new CreateTelescopeEditProposalSuccess({ editProposal: createdTelescopeEditProposal })
            )
          )
      )
    )
  );

  /*********************************************************************************************************************
   * Mounts
   ********************************************************************************************************************/

  CreateMount: Observable<CreateMountSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_MOUNT),
      map((action: CreateMount) => action.payload.mount),
      mergeMap(mount =>
        this.equipmentApiService
          .createMount(mount)
          .pipe(map(createdMount => new CreateMountSuccess({ item: createdMount })))
      )
    )
  );

  CreateMountEditProposal: Observable<CreateMountEditProposalSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_MOUNT_EDIT_PROPOSAL),
      map((action: CreateMountEditProposal) => action.payload.mount),
      mergeMap(mount =>
        this.equipmentApiService
          .createMountEditProposal(mount)
          .pipe(
            map(
              createdMountEditProposal => new CreateMountEditProposalSuccess({ editProposal: createdMountEditProposal })
            )
          )
      )
    )
  );

  /*********************************************************************************************************************
   * Filters
   ********************************************************************************************************************/

  CreateFilter: Observable<CreateFilterSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_FILTER),
      map((action: CreateFilter) => action.payload.filter),
      mergeMap(filter_ =>
        this.equipmentApiService
          .createFilter(filter_)
          .pipe(map(createdFilter => new CreateFilterSuccess({ item: createdFilter })))
      )
    )
  );

  CreateFilterEditProposal: Observable<CreateFilterEditProposalSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_FILTER_EDIT_PROPOSAL),
      map((action: CreateFilterEditProposal) => action.payload.filter),
      mergeMap(filter_ =>
        this.equipmentApiService
          .createFilterEditProposal(filter_)
          .pipe(
            map(
              createdFilterEditProposal =>
                new CreateFilterEditProposalSuccess({ editProposal: createdFilterEditProposal })
            )
          )
      )
    )
  );

  /*********************************************************************************************************************
   * Accessories
   ********************************************************************************************************************/

  CreateAccessory: Observable<CreateAccessorySuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_ACCESSORY),
      map((action: CreateAccessory) => action.payload.accessory),
      mergeMap(accessory =>
        this.equipmentApiService
          .createAccessory(accessory)
          .pipe(map(createdAccessory => new CreateAccessorySuccess({ item: createdAccessory })))
      )
    )
  );

  CreateAccessoryEditProposal: Observable<CreateAccessoryEditProposalSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_ACCESSORY_EDIT_PROPOSAL),
      map((action: CreateAccessoryEditProposal) => action.payload.accessory),
      mergeMap(accessory =>
        this.equipmentApiService
          .createAccessoryEditProposal(accessory)
          .pipe(
            map(
              createdAccessoryEditProposal =>
                new CreateAccessoryEditProposalSuccess({ editProposal: createdAccessoryEditProposal })
            )
          )
      )
    )
  );

  /*********************************************************************************************************************
   * Software
   ********************************************************************************************************************/

  CreateSoftware: Observable<CreateSoftwareSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_SOFTWARE),
      map((action: CreateSoftware) => action.payload.software),
      mergeMap(software =>
        this.equipmentApiService
          .createSoftware(software)
          .pipe(map(createdSoftware => new CreateSoftwareSuccess({ item: createdSoftware })))
      )
    )
  );

  CreateSoftwareEditProposal: Observable<CreateSoftwareEditProposalSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_SOFTWARE_EDIT_PROPOSAL),
      map((action: CreateSoftwareEditProposal) => action.payload.software),
      mergeMap(software =>
        this.equipmentApiService
          .createSoftwareEditProposal(software)
          .pipe(
            map(
              createdSoftwareEditProposal =>
                new CreateSoftwareEditProposalSuccess({ editProposal: createdSoftwareEditProposal })
            )
          )
      )
    )
  );

  /*********************************************************************************************************************
   * Marketplace
   ********************************************************************************************************************/
  LoadMarketplaceListings: Observable<LoadMarketplaceListingsSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.LOAD_MARKETPLACE_LISTINGS),
      map((action: LoadMarketplaceListings) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .loadMarketplaceListings(payload.options)
          .pipe(map(listings => new LoadMarketplaceListingsSuccess({ listings })))
      )
    )
  );

  CreateMarketplaceListing: Observable<CreateMarketplaceListingSuccess | CreateMarketplaceListingFailure> =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(EquipmentActionTypes.CREATE_MARKETPLACE_LISTING),
        map((action: CreateMarketplaceListing) => action.payload.listing),
        mergeMap(listing => {
          let listingId: MarketplaceListingInterface["id"];

          const toast = this.popNotificationsService.info(
            this.translateService.instant("Creating listing..."),
            this.translateService.instant("Please wait"),
            {
              progressBar: false,
              timeOut: 0
            }
          );

          return this.equipmentApiService.createMarketplaceListing(listing).pipe(
            switchMap(createdListing => {
              listingId = createdListing.id;
              return forkJoin(
                listing.lineItems.map(lineItem =>
                  of(null).pipe(
                    tap(() => {
                      toast.toastRef.componentInstance.message =
                        this.translateService.instant(`Working on equipment items...`);
                    }),
                    mergeMap(() =>
                      this.equipmentApiService
                        .createMarketplaceLineItem({
                          ...lineItem,
                          listing: createdListing.id
                        })
                        .pipe(
                          switchMap(createdLineItem =>
                            lineItem.images?.length
                              ? forkJoin(
                                  Object.keys(lineItem.images).map(key => {
                                    const image = lineItem.images[key];
                                    const imageIndex = parseInt(key, 10);

                                    if (!image) {
                                      return of(null);
                                    }

                                    return of(null).pipe(
                                      tap(() => {
                                        toast.toastRef.componentInstance.message =
                                          this.translateService.instant(`Working on images...`);
                                      }),
                                      mergeMap(() =>
                                        this.equipmentApiService.createMarketplaceImage(
                                          createdListing.id,
                                          createdLineItem.id,
                                          image.file,
                                          imageIndex
                                        )
                                      )
                                    );
                                  })
                                )
                              : of([null])
                          )
                        )
                    )
                  )
                )
              ).pipe(map(() => createdListing));
            }),
            map(createdListing => new CreateMarketplaceListingSuccess({ listing: createdListing })),
            catchError(error => {
              if (!!listingId) {
                const deleteOperation$ = this.equipmentApiService.deleteMarketplaceListing(listingId);
                deleteOperation$.subscribe();
              }
              return of(new CreateMarketplaceListingFailure({ error }));
            }),
            finalize(() => {
              this.popNotificationsService.clear(toast.toastId);
            })
          );
        })
      );
    });

  LoadMarketplaceListing: Observable<LoadMarketplaceListingSuccess | LoadMarketplaceListingFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.LOAD_MARKETPLACE_LISTING),
      map((action: LoadMarketplaceListing) => action.payload),
      mergeMap(payload => {
        let obs$: Observable<MarketplaceListingInterface>;
        if (payload.id) {
          obs$ = this.equipmentApiService.loadMarketplaceListing(payload.id);
        } else if (payload.hash) {
          obs$ = this.equipmentApiService.loadMarketplaceListingByHash(payload.hash);
        }
        return obs$.pipe(
          map(listing => new LoadMarketplaceListingSuccess({ listing })),
          catchError(error => of(new LoadMarketplaceListingFailure({ error })))
        );
      })
    )
  );

  DeleteMarketplaceListing: Observable<DeleteMarketplaceListingSuccess | DeleteMarketplaceListingFailure> =
    createEffect(() =>
      this.actions$.pipe(
        ofType(EquipmentActionTypes.DELETE_MARKETPLACE_LISTING),
        map((action: DeleteMarketplaceListing) => action.payload),
        mergeMap(payload =>
          this.equipmentApiService.deleteMarketplaceListing(payload.listing.id).pipe(
            map(() => new DeleteMarketplaceListingSuccess({ id: payload.listing.id })),
            catchError(error => of(new DeleteMarketplaceListingFailure({ error })))
          )
        )
      )
    );

  DeleteMarketplaceListingSuccess: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(EquipmentActionTypes.DELETE_MARKETPLACE_LISTING_SUCCESS),
        tap(() => this.popNotificationsService.success(this.translateService.instant("Listing deleted successfully")))
      ),
    { dispatch: false }
  );

  UpdateMarketplaceListing: Observable<UpdateMarketplaceListingSuccess | UpdateMarketplaceListingFailure> =
    createEffect(() =>
      this.actions$.pipe(
        ofType(EquipmentActionTypes.UPDATE_MARKETPLACE_LISTING),
        map((action: UpdateMarketplaceListing) => action.payload.listing),
        concatLatestFrom(updatedListing => this.store$.select(selectMarketplaceListing, { id: updatedListing.id })),
        switchMap(([updatedListing, previousListing]) => {
          const [preservedInitial, added, removedInitial] = this.equipmentMarketplaceService.compareLineItems(
            updatedListing,
            previousListing
          );

          let preserved = preservedInitial;
          let removed = removedInitial;

          // We don't edit or delete sold or reserved line items.
          preserved = preserved.filter(lineItem => !lineItem.sold && !lineItem.reserved);
          removed = removed.filter(lineItem => !lineItem.sold && !lineItem.reserved);

          const toast = this.popNotificationsService.info(
            this.translateService.instant("Updating listing..."),
            this.translateService.instant("Please wait"),
            {
              progressBar: false,
              timeOut: 0
            }
          );

          const _buildImageOperations = (lineItem: MarketplaceLineItemInterface) => {
            return lineItem.images.map((image, index) => {
              if (image === undefined || image === null) {
                return of(null);
              }

              return of(null).pipe(
                tap(
                  () =>
                    (toast.toastRef.componentInstance.message = this.translateService.instant(`Working on images...`))
                ),
                switchMap(() =>
                  this.equipmentApiService.createMarketplaceImage(updatedListing.id, lineItem.id, image.file, index)
                )
              );
            });
          };

          const deleteImageOperations$ = preserved.map(lineItem =>
            previousListing.lineItems
              .find(previousLineItem => previousLineItem.id === lineItem.id)
              .images.map(image =>
                this.equipmentApiService.deleteMarketplaceImage(updatedListing.id, lineItem.id, image.id)
              )
          );

          const createImageOperations$ = preserved.map(lineItem => _buildImageOperations(lineItem));

          const updateOperations$ = preserved.map(lineItem =>
            of(null).pipe(
              tap(
                () =>
                  (toast.toastRef.componentInstance.message =
                    this.translateService.instant(`Working on equipment items...`))
              ),
              mergeMap(() => this.equipmentApiService.updateMarketplaceLineItem(lineItem))
            )
          );

          const createOperations$ = added.map(lineItem =>
            of(null).pipe(
              tap(
                () =>
                  (toast.toastRef.componentInstance.message = this.translateService.instant(
                    "Working on equipment items..."
                  ))
              ),
              mergeMap(() =>
                this.equipmentApiService.createMarketplaceLineItem(lineItem).pipe(
                  switchMap(createdLineItem =>
                    forkJoin(
                      Object.keys(lineItem.images).map((key, index) => {
                        const image = lineItem.images[key];

                        if (!image) {
                          return of(null);
                        }

                        return this.equipmentApiService.createMarketplaceImage(
                          updatedListing.id,
                          createdLineItem.id,
                          image.file,
                          index
                        );
                      })
                    )
                  )
                )
              )
            )
          );

          const deleteOperations$ = removed.map(lineItem =>
            of(null).pipe(
              tap(
                () =>
                  (toast.toastRef.componentInstance.message =
                    this.translateService.instant(`Working on equipment items...`))
              ),
              switchMap(() =>
                forkJoin(
                  lineItem.images.map(image => {
                    if (image === undefined || image === null) {
                      return of(null);
                    }

                    return this.equipmentApiService.deleteMarketplaceImage(updatedListing.id, lineItem.id, image.id);
                  })
                )
              ),
              switchMap(() => this.equipmentApiService.deleteMarketplaceLineItem(updatedListing.id, lineItem.id))
            )
          );

          const updateListingOperation$ = this.equipmentApiService.updateMarketplaceListing(updatedListing);

          return concat(
            ...[].concat(...deleteImageOperations$), // flattens the array
            ...[].concat(...createImageOperations$), // flattens the array
            ...updateOperations$,
            ...createOperations$,
            ...deleteOperations$,
            updateListingOperation$
          ).pipe(
            last(),
            map((updatedListingResponse: MarketplaceListingInterface) => {
              return new UpdateMarketplaceListingSuccess({ listing: updatedListingResponse });
            }),
            catchError(error => of(new UpdateMarketplaceListingFailure({ error }))),
            finalize(() => {
              this.popNotificationsService.clear(toast.toastId);
            })
          );
        })
      )
    );

  UpdateMarketplaceListingSuccess: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(EquipmentActionTypes.UPDATE_MARKETPLACE_LISTING_SUCCESS),
        tap(() => this.popNotificationsService.success(this.translateService.instant("Listing updated successfully")))
      ),
    { dispatch: false }
  );

  ApproveMarketplaceListing: Observable<ApproveMarketplaceListingSuccess | ApproveMarketplaceListingFailure> =
    createEffect(() =>
      this.actions$.pipe(
        ofType(EquipmentActionTypes.APPROVE_MARKETPLACE_LISTING),
        map((action: ApproveMarketplaceListing) => action.payload),
        mergeMap(payload =>
          this.equipmentApiService.approveMarketplaceListing(payload.listing.id).pipe(
            map(listing => new ApproveMarketplaceListingSuccess({ listing })),
            catchError(error => of(new ApproveMarketplaceListingFailure({ listing: payload.listing, error })))
          )
        )
      )
    );

  ApproveMarketplaceListingSuccess: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(EquipmentActionTypes.APPROVE_MARKETPLACE_LISTING_SUCCESS),
        tap(() => this.popNotificationsService.success(this.translateService.instant("Listing approved successfully")))
      ),
    { dispatch: false }
  );

  RenewMarketplaceListing: Observable<RenewMarketplaceListingSuccess | RenewMarketplaceListingFailure> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(EquipmentActionTypes.RENEW_MARKETPLACE_LISTING),
        map((action: RenewMarketplaceListing) => action.payload),
        mergeMap(payload =>
          this.equipmentApiService.renewMarketplaceListing(payload.listing.id).pipe(
            map(listing => new RenewMarketplaceListingSuccess({ listing })),
            catchError(error => of(new RenewMarketplaceListingFailure({ listing: payload.listing, error })))
          )
        )
      )
  );

  RenewMarketplaceListingSuccess: Observable<MarketplaceListingInterface> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(EquipmentActionTypes.RENEW_MARKETPLACE_LISTING_SUCCESS),
        map((action: RenewMarketplaceListingSuccess) => action.payload.listing),
        tap(listing =>
          this.popNotificationsService.success(
            this.translateService.instant("Listing renewed until: {{0}}", {
              0: this.localDatePipe.transform(listing.expiration)
            })
          )
        )
      ),
    { dispatch: false }
  );

  MarkMarketplaceLineItemAsSold: Observable<
    MarkMarketplaceLineItemAsSoldSuccess | MarkMarketplaceLineItemAsSoldFailure
  > = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.MARK_MARKETPLACE_LINE_ITEM_AS_SOLD),
      map((action: MarkMarketplaceLineItemAsSold) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService
          .markMarketplaceLineItemAsSold(payload.lineItem.listing, payload.lineItem.id, payload.soldTo)
          .pipe(
            map(lineItem => new MarkMarketplaceLineItemAsSoldSuccess({ lineItem })),
            catchError(error =>
              of(
                new MarkMarketplaceLineItemAsSoldFailure({
                  lineItem: payload.lineItem,
                  soldTo: payload.soldTo,
                  error
                })
              )
            )
          )
      )
    )
  );

  LoadMarketplacePrivateConversations: Observable<
    LoadMarketplacePrivateConversationsSuccess | LoadMarketplacePrivateConversationsFailure
  > = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.LOAD_MARKETPLACE_PRIVATE_CONVERSATIONS),
      map((action: LoadMarketplacePrivateConversations) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService.loadMarketplacePrivateConversations(payload.listingId).pipe(
          map(
            privateConversations =>
              new LoadMarketplacePrivateConversationsSuccess({
                listingId: payload.listingId,
                privateConversations
              })
          ),
          catchError(error =>
            of(
              new LoadMarketplacePrivateConversationsFailure({
                listingId: payload.listingId,
                error
              })
            )
          )
        )
      )
    )
  );

  CreateMarketplacePrivateConversation: Observable<
    CreateMarketplacePrivateConversationSuccess | CreateMarketplacePrivateConversationFailure
  > = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_MARKETPLACE_PRIVATE_CONVERSATION),
      map((action: CreateMarketplacePrivateConversation) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService.createMarketplacePrivateConversation(payload.listingId, payload.userId).pipe(
          map(
            privateConversation =>
              new CreateMarketplacePrivateConversationSuccess({
                privateConversation
              })
          ),
          catchError(error =>
            of(
              new CreateMarketplacePrivateConversationFailure({
                listingId: payload.listingId,
                userId: payload.userId,
                error
              })
            )
          )
        )
      )
    )
  );

  UpdateMarketplacePrivateConversation: Observable<
    UpdateMarketplacePrivateConversationSuccess | UpdateMarketplacePrivateConversationFailure
  > = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.UPDATE_MARKETPLACE_PRIVATE_CONVERSATION),
      map((action: UpdateMarketplacePrivateConversation) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService.updateMarketplacePrivateConversation(payload.privateConversation).pipe(
          map(
            privateConversation =>
              new UpdateMarketplacePrivateConversationSuccess({
                privateConversation
              })
          ),
          catchError(error =>
            of(
              new UpdateMarketplacePrivateConversationFailure({
                privateConversation: payload.privateConversation,
                error
              })
            )
          )
        )
      )
    )
  );

  DeleteMarketplacePrivateConversation: Observable<
    DeleteMarketplacePrivateConversationSuccess | DeleteMarketplacePrivateConversationFailure
  > = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.DELETE_MARKETPLACE_PRIVATE_CONVERSATION),
      map((action: DeleteMarketplacePrivateConversation) => action.payload),

      mergeMap(payload =>
        this.equipmentApiService
          .deleteMarketplacePrivateConversation(payload.privateConversation.listing, payload.privateConversation.id)
          .pipe(
            map(
              () =>
                new DeleteMarketplacePrivateConversationSuccess({
                  id: payload.privateConversation.id,
                  userId: payload.privateConversation.user,
                  listingId: payload.privateConversation.listing
                })
            ),
            catchError(error =>
              of(
                new DeleteMarketplacePrivateConversationFailure({
                  userId: payload.privateConversation.user,
                  listingId: payload.privateConversation.listing,
                  error
                })
              )
            )
          )
      )
    )
  );

  CreateMarketplaceOffer: Observable<CreateMarketplaceOfferSuccess | CreateMarketplaceOfferFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.CREATE_MARKETPLACE_OFFER),
      map((action: CreateMarketplaceOffer) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService.createMarketplaceOffer(payload.offer).pipe(
          map(offer => new CreateMarketplaceOfferSuccess({ offer })),
          catchError(error => of(new CreateMarketplaceOfferFailure({ offer: payload.offer, error })))
        )
      )
    )
  );

  UpdateMarketplaceOffer: Observable<UpdateMarketplaceOfferSuccess | UpdateMarketplaceOfferFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER),
      map((action: UpdateMarketplaceOffer) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService.updateMarketplaceOffer(payload.offer).pipe(
          map(offer => new UpdateMarketplaceOfferSuccess({ offer })),
          catchError(error => of(new UpdateMarketplaceOfferFailure({ offer: payload.offer, error })))
        )
      )
    )
  );

  RejectMarketplaceOffer: Observable<RejectMarketplaceOfferSuccess | RejectMarketplaceOfferFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.REJECT_MARKETPLACE_OFFER),
      map((action: RejectMarketplaceOffer) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService.rejectMarketplaceOffer(payload.offer, payload.message).pipe(
          map(updatedOffer => new RejectMarketplaceOfferSuccess({ offer: updatedOffer })),
          catchError(error => of(new RejectMarketplaceOfferFailure({ offer: payload.offer, error })))
        )
      )
    )
  );

  RetractMarketplaceOffer: Observable<RetractMarketplaceOfferSuccess | RetractMarketplaceOfferFailure> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(EquipmentActionTypes.RETRACT_MARKETPLACE_OFFER),
        map((action: RetractMarketplaceOffer) => action.payload),
        mergeMap(payload =>
          this.equipmentApiService.retractMarketplaceOffer(payload.offer, payload.message).pipe(
            map(updatedOffer => new RetractMarketplaceOfferSuccess({ offer: updatedOffer })),
            catchError(error => of(new RetractMarketplaceOfferFailure({ offer: payload.offer, error })))
          )
        )
      )
  );

  AcceptMarketplaceOffer: Observable<AcceptMarketplaceOfferSuccess | AcceptMarketplaceOfferFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.ACCEPT_MARKETPLACE_OFFER),
      map((action: AcceptMarketplaceOffer) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService.acceptMarketplaceOffer(payload.offer, payload.message).pipe(
          map(updatedOffer => new AcceptMarketplaceOfferSuccess({ offer: updatedOffer })),
          catchError(error => of(new AcceptMarketplaceOfferFailure({ offer: payload.offer, error })))
        )
      )
    )
  );

  CreateMarketplaceFeedback: Observable<CreateMarketplaceFeedbackSuccess | CreateMarketplaceFeedbackFailure> =
    createEffect(() =>
      this.actions$.pipe(
        ofType(EquipmentActionTypes.CREATE_MARKETPLACE_FEEDBACK),
        map((action: CreateMarketplaceFeedback) => action.payload),
        mergeMap(payload =>
          this.equipmentApiService.createMarketplaceFeedback(payload.feedback).pipe(
            map(feedback => new CreateMarketplaceFeedbackSuccess({ feedback })),
            catchError(error => of(new CreateMarketplaceFeedbackFailure({ feedback: payload.feedback, error })))
          )
        )
      )
    );

  GetMarketplaceFeedback: Observable<GetMarketplaceFeedbackSuccess | GetMarketplaceFeedbackFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(EquipmentActionTypes.GET_MARKETPLACE_FEEDBACK),
      map((action: GetMarketplaceFeedback) => action.payload),
      mergeMap(payload =>
        this.equipmentApiService.getMarketplaceFeedback(payload.listing.id).pipe(
          map(feedback => new GetMarketplaceFeedbackSuccess({ feedback })),
          catchError(error => of(new GetMarketplaceFeedbackFailure({ listing: payload.listing, error })))
        )
      )
    )
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions<All>,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly utilsService: UtilsService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService
  ) {
    this.localDatePipe = new LocalDatePipe();
  }
}
