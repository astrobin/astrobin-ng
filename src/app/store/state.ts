import { CameraEffects } from "@app/store/effects/camera.effects";
import { ContentTypeEffects } from "@app/store/effects/content-type.effects";
import { FullscreenImageEffects } from "@app/store/effects/fullscreen-image.effects";
import { ImageEffects } from "@app/store/effects/image.effects";
import { InitializeAppEffects } from "@app/store/effects/initialize-app.effects";
import { SolutionEffects } from "@app/store/effects/solution.effects";
import { TelescopeEffects } from "@app/store/effects/telescope.effects";
import { ThumbnailEffects } from "@app/store/effects/thumbnail.effects";
import { AuthEffects } from "@features/account/store/auth.effects";
import { authReducer, AuthState, initialAuthState } from "@features/account/store/auth.reducers";
import { initialNotificationsState, notificationsReducer, NotificationsState } from "@features/notifications/store/notifications.reducers";
import { appReducer, AppState, initialAppState } from "./reducers/app.reducers";
import { LocationEffects } from "@app/store/effects/location.effects";
import { NotificationsEffects } from "@features/notifications/store/notifications.effects";
import { equipmentReducer, EquipmentState, initialEquipmentState } from "@features/equipment/store/equipment.reducer";
import { NestedCommentsEffects } from "@app/store/effects/nested-comments.effects";
import { EquipmentEffects } from "@features/equipment/store/equipment.effects";
import { initialSubscriptionsState, subscriptionsReducer, SubscriptionsState } from "@features/subscriptions/store/subscriptions.reducers";
import { SubscriptionsEffects } from "@features/subscriptions/store/subscriptions.effects";
import { TogglePropertyEffects } from "@app/store/effects/toggle-property.effects";
import { initialSearchState, searchReducer, SearchState } from "@features/search/state/state.reducer";
import { SearchEffects } from "@features/search/state/search.effects";
import { RemoteSourceAffiliatesEffects } from "@app/store/effects/remote-source-affiliates.effects";
import { GroupEffects } from "@app/store/effects/group.effect";
import { CollectionEffects } from "@app/store/effects/collection.effects";
import { Action, ActionReducer, ActionReducerMap, createAction, MetaReducer, props } from "@ngrx/store";

export interface MainState {
  app: AppState;
  auth: AuthState;
  equipment: EquipmentState;
  notifications: NotificationsState;
  search: SearchState;
  subscriptions: SubscriptionsState;
}

export const initialMainState: MainState = {
  app: initialAppState,
  auth: initialAuthState,
  equipment: initialEquipmentState,
  notifications: initialNotificationsState,
  search: initialSearchState,
  subscriptions: initialSubscriptionsState
};

export const mainStateReducers: ActionReducerMap<MainState> = {
  app: appReducer,
  auth: authReducer,
  equipment: equipmentReducer,
  notifications: notificationsReducer,
  search: searchReducer,
  subscriptions: subscriptionsReducer
};

export const setInitialState = createAction(
  '[Main] Set initial state',
  props<{ payload: MainState }>()
);

export function rootMetaReducer(reducer: ActionReducer<MainState>): ActionReducer<MainState> {
  return (state: MainState | undefined, action: Action) => {
    // Check if the action is `setInitialState` by comparing the action type
    if (action.type === setInitialState.type) {
      return (action as ReturnType<typeof setInitialState>).payload; // Replace the entire state with the payload
    }
    // Delegate to the original reducer for all other actions
    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer<MainState>[] = [rootMetaReducer];

export const mainStateEffects = [
  AuthEffects,
  CameraEffects,
  ContentTypeEffects,
  EquipmentEffects,
  FullscreenImageEffects,
  ImageEffects,
  InitializeAppEffects,
  LocationEffects,
  NestedCommentsEffects,
  NotificationsEffects,
  SearchEffects,
  SolutionEffects,
  SubscriptionsEffects,
  TelescopeEffects,
  ThumbnailEffects,
  TogglePropertyEffects,
  RemoteSourceAffiliatesEffects,
  GroupEffects,
  CollectionEffects
];
