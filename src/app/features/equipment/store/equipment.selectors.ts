import { MainState } from "@app/store/state";
import { UserInterface } from "@core/interfaces/user.interface";
import { EquipmentMarketplaceService } from "@core/services/equipment-marketplace.service";
import { EquipmentState } from "@features/equipment/store/equipment.reducer";
import { instanceOfAccessory } from "@features/equipment/types/accessory.interface";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { instanceOfCamera } from "@features/equipment/types/camera.interface";
import { EditProposalInterface } from "@features/equipment/types/edit-proposal.interface";
import { EquipmentItemType, EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItemMostOftenUsedWithData } from "@features/equipment/types/equipment-item-most-often-used-with-data.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import { instanceOfFilter } from "@features/equipment/types/filter.interface";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { MarketplaceOfferInterface } from "@features/equipment/types/marketplace-offer.interface";
import { MarketplacePrivateConversationInterface } from "@features/equipment/types/marketplace-private-conversation.interface";
import { instanceOfMount } from "@features/equipment/types/mount.interface";
import { instanceOfSensor } from "@features/equipment/types/sensor.interface";
import { instanceOfSoftware } from "@features/equipment/types/software.interface";
import { instanceOfTelescope } from "@features/equipment/types/telescope.interface";
import { createSelector } from "@ngrx/store";

export function getEquipmentItemType(item: EquipmentItemBaseInterface): EquipmentItemType {
  if (instanceOfSensor(item)) {
    return EquipmentItemType.SENSOR;
  }

  if (instanceOfCamera(item)) {
    return EquipmentItemType.CAMERA;
  }

  if (instanceOfTelescope(item)) {
    return EquipmentItemType.TELESCOPE;
  }

  if (instanceOfMount(item)) {
    return EquipmentItemType.MOUNT;
  }

  if (instanceOfFilter(item)) {
    return EquipmentItemType.FILTER;
  }

  if (instanceOfAccessory(item)) {
    return EquipmentItemType.ACCESSORY;
  }

  if (instanceOfSoftware(item)) {
    return EquipmentItemType.SOFTWARE;
  }

  throw new Error("Unknown type");
}

export function arrayUniqueEquipmentItems(
  array: (EquipmentItemBaseInterface | EditProposalInterface<EquipmentItemBaseInterface>)[]
): (EquipmentItemBaseInterface | EditProposalInterface<EquipmentItemBaseInterface>)[] {
  // The array is reverser because this algorithm prefers to keep the object appearing later in the array.
  const a: (EquipmentItemBaseInterface | EditProposalInterface<EquipmentItemBaseInterface>)[] = array
    .concat()
    .reverse();

  for (let i = 0; i < a.length; ++i) {
    for (let j = i + 1; j < a.length; ++j) {
      if (a[i].id === a[j].id && getEquipmentItemType(a[i]) === getEquipmentItemType(a[j])) {
        a.splice(j--, 1);
      }
    }
  }

  return a;
}

export const selectEquipment = (state: MainState): EquipmentState => state.equipment;

export const selectBrands = createSelector(selectEquipment, state => state.brands);

export const selectBrand = createSelector(selectBrands, (brands: BrandInterface[], id: number) => {
  const matching = brands.filter(brand => brand.id === id);
  return matching.length > 0 ? matching[0] : null;
});

export const selectEquipmentItems = createSelector(selectEquipment, state => state.equipmentItems);

export const selectEquipmentItem = createSelector(
  selectEquipmentItems,
  (items: EquipmentItem[], data: { id: number; type: EquipmentItemType }): EquipmentItem | null => {
    const matching = items.filter(item => {
      const itemType = getEquipmentItemType(item);
      return item.id === data.id && itemType === data.type;
    });
    return matching.length > 0 ? matching[0] : null;
  }
);

export const selectEditProposals = createSelector(selectEquipment, state => state.editProposals);

export const selectEditProposalsForItem = createSelector(
  selectEditProposals,
  (editProposals: EditProposalInterface<EquipmentItemBaseInterface>[], item: EquipmentItemBaseInterface) => {
    const type: EquipmentItemType = getEquipmentItemType(item);
    return editProposals.filter(editProposal => {
      const thisType: EquipmentItemType = getEquipmentItemType(editProposal);
      return item.id === editProposal.editProposalTarget && type === thisType;
    });
  }
);

export const selectEquipmentPresets = createSelector(selectEquipment, state => state.presets);

export const selectEquipmentPreset = createSelector(
  selectEquipmentPresets,
  (presets: EquipmentPresetInterface[], data: { id: EquipmentPresetInterface["id"] }) => {
    const matching = presets.filter(preset => {
      return preset.id === data.id;
    });
    return matching.length > 0 ? matching[0] : null;
  }
);

export const selectMostOftenUsedWith = createSelector(selectEquipment, state => state.mostOftenUsedWithData);

export const selectMostOftenUsedWithForItem = createSelector(
  selectMostOftenUsedWith,
  (
    mostOftenUsedWith: EquipmentItemMostOftenUsedWithData,
    data: { itemType: EquipmentItemType; itemId: EquipmentItemBaseInterface["id"] }
  ) => {
    const key = `${data.itemType}-${data.itemId}`;
    return mostOftenUsedWith[key];
  }
);

export const selectEquipmentContributors = createSelector(selectEquipment, state => state.contributors);

export const selectMarketplace = createSelector(selectEquipment, state => state.marketplace);

export const selectMarketplaceListings = createSelector(selectMarketplace, state => state.listings);

export const selectMarketplaceListing = createSelector(
  selectMarketplaceListings,
  (listings: MarketplaceListingInterface[], props: { id: MarketplaceListingInterface["id"] }) =>
    listings?.find(listing => listing.id === props.id) || null
);

export const selectMarketplaceListingByHash = (hash: MarketplaceListingInterface["hash"]) =>
  createSelector(selectMarketplaceListings, listings => listings?.find(listing => listing.hash === hash) || null);

export const selectMarketplacePrivateConversations = (
  listingId: MarketplaceListingInterface["id"],
  userId?: UserInterface["id"]
) =>
  createSelector(selectMarketplace, marketplace =>
    marketplace.privateConversations.filter(conversation => {
      let result = conversation.listing === listingId;

      if (userId) {
        result = result && conversation.user === userId;
      }

      return result;
    })
  );

export const selectMarketplacePrivateConversation = (conversationId: MarketplacePrivateConversationInterface["id"]) =>
  createSelector(
    selectMarketplace,
    marketplace => marketplace.privateConversations.find(conversation => conversation.id === conversationId) || null
  );

export const selectMarketplaceOffersByUser = (
  userId: UserInterface["id"],
  listingId: MarketplaceListingInterface["id"]
) => {
  return createSelector(selectMarketplace, marketplace => {
    const listing = marketplace.listings.find(listing => listing.id === listingId);

    if (!!listing) {
      return EquipmentMarketplaceService.offersByUser(userId, listing);
    }

    return [];
  });
};
