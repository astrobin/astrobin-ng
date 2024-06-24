import { EquipmentActionTypes } from "./equipment.actions";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { EditProposalInterface } from "@features/equipment/types/edit-proposal.interface";
import { arrayUniqueEquipmentItems, getEquipmentItemType } from "@features/equipment/store/equipment.selectors";
import { CameraInterface } from "@features/equipment/types/camera.interface";
import { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import { EquipmentItemMostOftenUsedWithData } from "@features/equipment/types/equipment-item-most-often-used-with-data.interface";
import { ContributorInterface } from "@features/equipment/types/contributor.interface";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { MarketplacePrivateConversationInterface } from "@features/equipment/types/marketplace-private-conversation.interface";
import { MarketplaceFeedbackInterface } from "@features/equipment/types/marketplace-feedback.interface";

export const equipmentFeatureKey = "equipment";

function sortMarketplaceListings(a: MarketplaceListingInterface, b: MarketplaceListingInterface): number {
  // Check if both 'approved' fields are not null
  if (a.approved !== null && b.approved !== null) {
    return new Date(b.approved).getTime() - new Date(a.approved).getTime();
  }

  // If 'approved' of 'a' is null and 'b' is not null, 'b' should come first
  if (a.approved === null && b.approved !== null) {
    return 1;
  }

  // If 'approved' of 'b' is null and 'a' is not null, 'a' should come first
  if (a.approved !== null && b.approved === null) {
    return -1;
  }

  // If both 'approved' fields are null, sort by 'created' field
  return new Date(b.updated).getTime() - new Date(a.updated).getTime();
}

export interface EquipmentState {
  brands: BrandInterface[];
  brandsCount: number;
  equipmentItems: EquipmentItemBaseInterface[];
  editProposals: EditProposalInterface<EquipmentItemBaseInterface>[];
  presets: EquipmentPresetInterface[];
  mostOftenUsedWithData: EquipmentItemMostOftenUsedWithData | {};
  contributors: ContributorInterface[];
  marketplace: {
    // As we're not storing a PaginatedApiResponseInterface, we need to store the last paginated request count.
    lastPaginatedRequestCount: number | null;
    listings: MarketplaceListingInterface[] | null;
    privateConversations: MarketplacePrivateConversationInterface[];
  };
}

export const initialEquipmentState: EquipmentState = {
  brands: [],
  brandsCount: null,
  equipmentItems: [],
  editProposals: [],
  presets: [],
  mostOftenUsedWithData: {},
  contributors: [],
  marketplace: {
    lastPaginatedRequestCount: null,
    listings: null,
    privateConversations: []
  }
};

function editProposalCompareFunction(
  a: EditProposalInterface<EquipmentItemBaseInterface>,
  b: EditProposalInterface<EquipmentItemBaseInterface>
): number {
  const aDate: Date = new Date(a.editProposalCreated + "Z");
  const bDate: Date = new Date(b.editProposalCreated + "Z");

  if (aDate < bDate) {
    return -1;
  }

  if (aDate > bDate) {
    return 1;
  }

  return 0;
}

export function reducer(state = initialEquipmentState, action: PayloadActionInterface): EquipmentState {
  switch (action.type) {
    case EquipmentActionTypes.GET_ALL_BRANDS_SUCCESS:
      return {
        ...state,
        brands: UtilsService.arrayUniqueObjects([...state.brands, ...action.payload.response.results], "id"),
        brandsCount: action.payload.response.count
      };

    case EquipmentActionTypes.LOAD_BRAND_SUCCESS:
    case EquipmentActionTypes.CREATE_BRAND_SUCCESS: {
      return {
        ...state,
        brands: UtilsService.arrayUniqueObjects([...state.brands, ...[action.payload.brand]], "id")
      };
    }

    case EquipmentActionTypes.FIND_ALL_BRANDS_SUCCESS: {
      return {
        ...state,
        brands: UtilsService.arrayUniqueObjects([...state.brands, ...action.payload.brands], "id")
      };
    }

    case EquipmentActionTypes.FIND_ALL_EQUIPMENT_ITEMS_SUCCESS:
    case EquipmentActionTypes.FIND_RECENTLY_USED_EQUIPMENT_ITEMS_SUCCESS:
    case EquipmentActionTypes.FIND_SIMILAR_IN_BRAND_SUCCESS:
    case EquipmentActionTypes.GET_OTHERS_IN_BRAND_SUCCESS: {
      return {
        ...state,
        equipmentItems: arrayUniqueEquipmentItems([...state.equipmentItems, ...action.payload.items])
      };
    }

    case EquipmentActionTypes.GET_ALL_IN_BRAND_SUCCESS: {
      return {
        ...state,
        equipmentItems: arrayUniqueEquipmentItems([...state.equipmentItems, ...action.payload.response.results])
      };
    }

    case EquipmentActionTypes.LOAD_EQUIPMENT_ITEM_SUCCESS:
    case EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_SUCCESS:
    case EquipmentActionTypes.UNAPPROVE_EQUIPMENT_ITEM_SUCCESS:
    case EquipmentActionTypes.CREATE_SENSOR_SUCCESS:
    case EquipmentActionTypes.CREATE_CAMERA_SUCCESS:
    case EquipmentActionTypes.CREATE_TELESCOPE_SUCCESS:
    case EquipmentActionTypes.CREATE_MOUNT_SUCCESS:
    case EquipmentActionTypes.CREATE_FILTER_SUCCESS:
    case EquipmentActionTypes.CREATE_ACCESSORY_SUCCESS:
    case EquipmentActionTypes.CREATE_SOFTWARE_SUCCESS:
    case EquipmentActionTypes.LOAD_SENSOR_SUCCESS:
    case EquipmentActionTypes.ASSIGN_ITEM_SUCCESS:
    case EquipmentActionTypes.FREEZE_EQUIPMENT_ITEM_AS_AMBIGUOUS_SUCCESS:
    case EquipmentActionTypes.UNFREEZE_EQUIPMENT_ITEM_AS_AMBIGUOUS_SUCCESS: {
      return {
        ...state,
        equipmentItems: arrayUniqueEquipmentItems([...state.equipmentItems, ...[action.payload.item]])
      };
    }

    case EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_SUCCESS: {
      const rejectedItem = action.payload.item;
      let equipmentItems = arrayUniqueEquipmentItems([...state.equipmentItems, ...[rejectedItem]]);

      if (rejectedItem.klass === EquipmentItemType.SENSOR) {
        // Update cameras that used to have this sensors.
        equipmentItems = equipmentItems.map(equipmentItem => {
          if (
            equipmentItem.klass === EquipmentItemType.CAMERA &&
            (equipmentItem as CameraInterface).sensor === rejectedItem.id
          ) {
            (equipmentItem as CameraInterface).sensor = null;
          }

          return equipmentItem;
        });
      }

      return {
        ...state,
        equipmentItems: equipmentItems.filter(
          item => item.klass !== rejectedItem.klass && item.id !== rejectedItem.id
        )
      };
    }

    case EquipmentActionTypes.CREATE_SENSOR_EDIT_PROPOSAL_SUCCESS:
    case EquipmentActionTypes.CREATE_CAMERA_EDIT_PROPOSAL_SUCCESS:
    case EquipmentActionTypes.CREATE_TELESCOPE_EDIT_PROPOSAL_SUCCESS:
    case EquipmentActionTypes.CREATE_MOUNT_EDIT_PROPOSAL_SUCCESS:
    case EquipmentActionTypes.CREATE_FILTER_EDIT_PROPOSAL_SUCCESS:
    case EquipmentActionTypes.CREATE_ACCESSORY_EDIT_PROPOSAL_SUCCESS:
    case EquipmentActionTypes.CREATE_SOFTWARE_EDIT_PROPOSAL_SUCCESS:
    case EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS:
    case EquipmentActionTypes.ASSIGN_EDIT_PROPOSAL_SUCCESS: {
      return {
        ...state,
        editProposals: (
          arrayUniqueEquipmentItems([
            ...state.editProposals,
            ...[action.payload.editProposal]
          ]) as EditProposalInterface<EquipmentItemBaseInterface>[]
        )
          .sort(editProposalCompareFunction)
          .reverse()
      };
    }

    case EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS: {
      return {
        ...state,
        equipmentItems: state.equipmentItems.filter(item => {
          return (
            item.id !== action.payload.editProposal.editProposalTarget &&
            getEquipmentItemType(item) !== getEquipmentItemType(action.payload.editProposal)
          );
        }),
        editProposals: (
          arrayUniqueEquipmentItems([
            ...state.editProposals,
            ...[action.payload.editProposal]
          ]) as EditProposalInterface<EquipmentItemBaseInterface>[]
        )
          .sort(editProposalCompareFunction)
          .reverse()
      };
    }

    case EquipmentActionTypes.FIND_EQUIPMENT_ITEM_EDIT_PROPOSALS_SUCCESS: {
      return {
        ...state,
        editProposals: UtilsService.arrayUniqueObjects(
          [...state.editProposals, ...action.payload.editProposals.results].sort(editProposalCompareFunction).reverse(),
          "id"
        )
      };
    }

    case EquipmentActionTypes.FIND_EQUIPMENT_PRESETS_SUCCESS: {
      return {
        ...state,
        presets: UtilsService.arrayUniqueObjects([...state.presets, ...action.payload.presets], "id")
      };
    }

    case EquipmentActionTypes.CREATE_EQUIPMENT_PRESET_SUCCESS:
    case EquipmentActionTypes.UPDATE_EQUIPMENT_PRESET_SUCCESS: {
      return {
        ...state,
        presets: UtilsService.arrayUniqueObjects([...state.presets, action.payload.preset], "id")
      };
    }

    case EquipmentActionTypes.DELETE_EQUIPMENT_PRESET_SUCCESS: {
      return {
        ...state,
        presets: state.presets.filter(preset => preset.id !== action.payload.id)
      };
    }

    case EquipmentActionTypes.GET_MOST_OFTEN_USED_WITH_SUCCESS: {
      const key = `${action.payload.itemType}-${action.payload.itemId}`;
      return {
        ...state,
        mostOftenUsedWithData: {
          ...state.mostOftenUsedWithData,
          ...{
            [key]: action.payload.data
          }
        }
      };
    }

    case EquipmentActionTypes.GET_CONTRIBUTORS_SUCCESS: {
      return {
        ...state,
        contributors: action.payload.contributors
      };
    }

    case AppActionTypes.CREATE_TOGGLE_PROPERTY_SUCCESS: {
      const contentType = action.payload.toggleProperty.contentType;
      const objectId = action.payload.toggleProperty.objectId;
      const propertyType = action.payload.toggleProperty.propertyType;

      const item = state.equipmentItems.find(item => item.id == objectId && item.contentType === contentType);

      if (propertyType === "follow" && !!item) {
        return {
          ...state,
          equipmentItems: state.equipmentItems.map(item => {
            if (item.id == objectId && item.contentType === contentType) {
              item.followed = true;
            }
            return item;
          })
        };
      } else {
        return { ...state };
      }
    }

    case AppActionTypes.DELETE_TOGGLE_PROPERTY_SUCCESS: {
      const contentType = action.payload.toggleProperty.contentType;
      const objectId = action.payload.toggleProperty.objectId;
      const propertyType = action.payload.toggleProperty.propertyType;

      const item = state.equipmentItems.find(item => item.id == objectId && item.contentType === contentType);

      if (propertyType === "follow" && !!item) {
        return {
          ...state,
          equipmentItems: state.equipmentItems.map(item => {
            if (item.id == objectId && item.contentType === contentType) {
              item.followed = false;
            }
            return item;
          })
        };
      } else {
        return { ...state };
      }
    }

    case EquipmentActionTypes.CLEAR_MARKETPLACE_LISTINGS: {
      return {
        ...state,
        marketplace: {
          ...state.marketplace,
          lastPaginatedRequestCount: null,
          listings: null
        }
      };
    }

    case EquipmentActionTypes.LOAD_MARKETPLACE_LISTINGS_SUCCESS: {
      return {
        ...state,
        marketplace: {
          ...state.marketplace,
          lastPaginatedRequestCount: action.payload.listings.count,
          listings: UtilsService.arrayUniqueObjects([
            ...state.marketplace.listings || [],
            ...action.payload.listings.results
          ], "id").sort(sortMarketplaceListings)
        }
      };
    }

    case EquipmentActionTypes.CREATE_MARKETPLACE_LISTING_SUCCESS:
    case EquipmentActionTypes.LOAD_MARKETPLACE_LISTING_SUCCESS:
    case EquipmentActionTypes.UPDATE_MARKETPLACE_LISTING_SUCCESS:
    case EquipmentActionTypes.APPROVE_MARKETPLACE_LISTING_SUCCESS:
    case EquipmentActionTypes.RENEW_MARKETPLACE_LISTING_SUCCESS: {
      return {
        ...state,
        marketplace: {
          ...state.marketplace,
          listings: [
            ...(state.marketplace.listings?.filter(listing => listing.id !== action.payload.listing.id) || []),
            action.payload.listing
          ].sort(sortMarketplaceListings)
        }
      };
    }

    case EquipmentActionTypes.DELETE_MARKETPLACE_LISTING_SUCCESS: {
      return {
        ...state,
        marketplace: {
          ...state.marketplace,
          listings: state.marketplace.listings.filter(listing => listing.id !== action.payload.id)
        }
      };
    }

    case EquipmentActionTypes.LOAD_MARKETPLACE_PRIVATE_CONVERSATIONS_SUCCESS: {
      return {
        ...state,
        marketplace: {
          ...state.marketplace,
          privateConversations: UtilsService.arrayUniqueObjects(
            [...(state.marketplace.privateConversations || []), ...action.payload.privateConversations],
            "id"
          ).sort((a, b) => {
            if (a.lastMessageTimestamp && b.lastMessageTimestamp) {
              return new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime();
            }

            return new Date(b.created).getTime() - new Date(a.created).getTime();
          })
        }
      };
    }

    case EquipmentActionTypes.CREATE_MARKETPLACE_PRIVATE_CONVERSATION_SUCCESS:
    case EquipmentActionTypes.UPDATE_MARKETPLACE_PRIVATE_CONVERSATION_SUCCESS:
      return {
        ...state,
        marketplace: {
          ...state.marketplace,
          privateConversations: [
            ...(state.marketplace.privateConversations?.filter(
              conversation => conversation.id !== action.payload.privateConversation.id
            ) || []),
            action.payload.privateConversation
          ].sort((a, b) => b.id - a.id)
        }
      };

    case EquipmentActionTypes.MARK_MARKETPLACE_LINE_ITEM_AS_SOLD_SUCCESS:
      const updatedLineItem = action.payload.lineItem;

      // Create a new updatedListings array with immutability in mind
      const updatedListings = state.marketplace.listings.map(listing => {
        if (listing.id !== updatedLineItem.listing) {
          // If the listing does not match, return it as is
          return listing;
        }

        // Map over lineItems to find the one that matches and update it
        const updatedLineItems = listing.lineItems.map(lineItem => {
          if (lineItem.id !== updatedLineItem.id) {
            // If the lineItem does not match, return it as is
            return lineItem;
          }

          // If the lineItem matches, update it
          return updatedLineItem;
        });

        // Return the listing with the updated lineItems
        return {
          ...listing,
          lineItems: updatedLineItems
        };
      });

      return {
        ...state,
        marketplace: {
          ...state.marketplace,
          listings: updatedListings
        }
      };

    case EquipmentActionTypes.DELETE_MARKETPLACE_PRIVATE_CONVERSATION_SUCCESS:
      return {
        ...state,
        marketplace: {
          ...state.marketplace,
          privateConversations: state.marketplace.privateConversations.filter(
            conversation => conversation.id !== action.payload.id
          )
        }
      };

    case EquipmentActionTypes.CREATE_MARKETPLACE_OFFER_SUCCESS: {
      const newOffer = action.payload.offer;

      // Create a new updatedListings array with immutability in mind
      const updatedListings = state.marketplace.listings.map(listing => {
        if (listing.id !== newOffer.listing) {
          // If the listing does not match, return it as is
          return listing;
        }

        // Map over lineItems to find the one that matches and update it
        const updatedLineItems = listing.lineItems.map(lineItem => {
          if (lineItem.id !== newOffer.lineItem) {
            // If the lineItem does not match, return it as is
            return lineItem;
          }

          // Add the new offer to the lineItem's offers array
          return {
            ...lineItem,
            offers: [...lineItem.offers, newOffer]
          };
        });

        // Return the listing with the updated lineItems
        return {
          ...listing,
          lineItems: updatedLineItems
        };
      });

      // Return the updated state with the updated listings
      return {
        ...state,
        marketplace: {
          ...state.marketplace,
          listings: updatedListings
        }
      };
    }

    case EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER_SUCCESS: {
      const updatedOffer = action.payload.offer;

      // Map over the listings to find the one that matches the updated offer's listing
      const updatedListings = state.marketplace.listings.map(listing => {
        if (listing.id !== updatedOffer.listing) {
          // If the listing does not match, return it as is
          return listing;
        }

        // Map over the lineItems in the matching listing to find the one that matches the offer's lineItem
        const updatedLineItems = listing.lineItems.map(lineItem => {
          if (lineItem.id !== updatedOffer.lineItem) {
            // If the lineItem does not match, return it as is
            return lineItem;
          }

          // Map over the offers in the matching lineItem to update the offer
          const updatedOffers = lineItem.offers.map(offer => {
            if (offer.id !== updatedOffer.id) {
              // If the offer does not match, return it as is
              return offer;
            }

            // Return the updated offer
            return updatedOffer;
          });

          // Return the lineItem with the updated offers
          return {
            ...lineItem,
            offers: updatedOffers
          };
        });

        // Return the listing with the updated lineItems
        return {
          ...listing,
          lineItems: updatedLineItems
        };
      });

      // Return the updated state with the updated listings
      return {
        ...state,
        marketplace: {
          ...state.marketplace,
          listings: updatedListings
        }
      };
    }


    case EquipmentActionTypes.REJECT_MARKETPLACE_OFFER_SUCCESS:
    case EquipmentActionTypes.RETRACT_MARKETPLACE_OFFER_SUCCESS: {
      const updatedOffer = action.payload.offer;

      // Create a new updatedListings array with immutability in mind
      const updatedListings = state.marketplace.listings.map(listing => {
        if (listing.id !== updatedOffer.listing) {
          // If the listing does not match, return it as is
          return listing;
        }

        // Map over lineItems to find the one that matches and update it
        const updatedLineItems = listing.lineItems.map(lineItem => {
          if (lineItem.id !== updatedOffer.lineItem) {
            // If the lineItem does not match, return it as is
            return lineItem;
          }

          // Map over the offers in the lineItem to update the offer
          const updatedOffers = lineItem.offers.map(offer => {
            if (offer.id !== updatedOffer.id) {
              // If the offer does not match, return it as is
              return offer;
            }

            // Return the updated offer
            return updatedOffer;
          });

          // Return the lineItem with the updated offers
          return {
            ...lineItem,
            reserved: updatedOffer.user === lineItem.reservedTo ? null : lineItem.reserved,
            reservedTo: updatedOffer.user === lineItem.reservedTo ? null : lineItem.reservedTo,
            offers: updatedOffers
          };
        });

        // Return the listing with the updated lineItems
        return {
          ...listing,
          lineItems: updatedLineItems
        };
      });

      // Return the updated state with the updated listings
      return {
        ...state,
        marketplace: {
          ...state.marketplace,
          listings: updatedListings
        }
      };
    }

    case EquipmentActionTypes.ACCEPT_MARKETPLACE_OFFER_SUCCESS: {
      const acceptedOffer = action.payload.offer;

      // Create a new updatedListings array with immutability in mind
      const updatedListings = state.marketplace.listings.map(listing => {
        if (listing.id !== acceptedOffer.listing) {
          // If the listing does not match, return it as is
          return listing;
        }

        // Map over lineItems to find the one that matches and update it
        const updatedLineItems = listing.lineItems.map(lineItem => {
          if (lineItem.id !== acceptedOffer.lineItem) {
            // If the lineItem does not match, return it as is
            return lineItem;
          }

          // Map over the offers in the lineItem to update the offer
          const updatedOffers = lineItem.offers.map(offer => {
            if (offer.id !== acceptedOffer.id) {
              return offer;
            }

            return acceptedOffer;
          });

          // Return the lineItem with the updated offers
          return {
            ...lineItem,
            reserved: new Date().toISOString(),
            reservedTo: acceptedOffer.user,
            offers: updatedOffers
          };
        });

        // Return the listing with the updated lineItems
        return {
          ...listing,
          lineItems: updatedLineItems
        };
      });

      // Return the updated state with the updated listings
      return {
        ...state,
        marketplace: {
          ...state.marketplace,
          listings: updatedListings
        }
      };
    }

    case EquipmentActionTypes.CREATE_MARKETPLACE_FEEDBACK_SUCCESS: {
      const newFeedback: MarketplaceFeedbackInterface = action.payload.feedback;
      const lineItemId = newFeedback.lineItem;

      // Find listing that has this line item id.
      const listing = state.marketplace.listings.find(listing => listing.lineItems.some(lineItem => lineItem.id === lineItemId));

      // Update feedback in line item.
      const updatedLineItems = listing.lineItems.map(lineItem => {
        if (lineItem.id !== lineItemId) {
          return lineItem;
        }

        const updatedFeedbacks = lineItem.feedbacks.concat(newFeedback);

        return {
          ...lineItem,
          feedbacks: updatedFeedbacks
        };
      });

      // Update state with the updated listing.
      const updatedListings = state.marketplace.listings.map(listing => {
        if (listing.id !== listing.id) {
          return listing;
        }

        return {
          ...listing,
          lineItems: updatedLineItems
        };
      });

      // Return the updated state with the updated listings
      return {
        ...state,
        marketplace: {
          ...state.marketplace,
          listings: updatedListings
        }
      };
    }

    default: {
      return state;
    }
  }
}
