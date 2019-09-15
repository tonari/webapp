import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import * as api from './api';
import { indexById, facilityById } from './common';

export interface ApiBufferingState {
  // index into `facilities` of the current facility
  // invariant: `curFacility === null` iff `facilities === null`
  curFacility: number | null,

  // data about the facilities in the current search
  // null means that the data hasn't finished loading
  facilities: api.Facility[] | null,

  // images of the facilities
  // only access `images` by using `idToStr`
  images: { [key: string]: string[] },

  // last requested position
  // lastReq is null before any request happened
  lastReq: api.Position | null,

  // comments of a facility
  comments: { [key: string]: api.Comment[] },

  // address of a facility
  addresses: { [key: string]: string | null },
};

export interface GlobalState {
  // is the picture of the current FacilityGallery displayed in fullscreen mode?
  fullscreen: boolean,

  // include facilities without accessibility in the search?
  includePlacesWithoutAccessibility: boolean,
};

// actions
const acCallback = (facilities: api.Facility[], curFacility: number) => ({
  type: 'AC_CALLBACK',
  facilities,
  curFacility,
});

const resetFacility = () => ({
  type: 'AC_CALLBACK',
  facilities: null,
  curFacility: null,
});

const chooseFacilityCallback = (curFacility: number) => ({
  type: 'CHOOSE_FACILITY_CALLBACK',
  curFacility,
});

const imageCallback = (id: api.Id, facilityURLs: string[]) => ({
  type: 'IMAGE_CALLBACK',
  id,
  facilityURLs,
});

const commentsCallback = (id: api.Id, comments: api.Comment[]) => ({
  type: 'COMMENTS_CALLBACK',
  id,
  comments,
});

const addressCallback = (id: api.Id, address: string | null) => ({
  type: 'ADDRESS_CALLBACK',
  id,
  address,
});

const updatAttributesCallback = (id: api.Id, attributes: api.Attributes) => ({
  type: 'UPDATE_ATTRIBUTES_CALLBACK',
  id,
  attributes,
});

const setLastRequest = (pos: api.Position) => ({
  type: 'SET_LAST_REQUEST',
  pos,
});

export const setFullscreen = (fullscreen: Boolean) => ({
  type: 'SET_FULLSCREEN',
  fullscreen,
});

const setIncludePlacesWithoutAccessibility = (includePlacesWithoutAccessibility: Boolean) => ({
  type: 'SET_INCLUDE_PLACES_WITHOUT_ACCESSIBILITY',
  includePlacesWithoutAccessibility,
});

// thunks
// requestedId: this is interesting for resuming sessions: choose which facility should be the active after the facilities were loaded. by default it's the first one
export const radiusSearch = (pos: api.Position, requestedId: api.Id | null = null, forceReloading: boolean = false) => {
  return async (dispatch: any, getState: any) => {
    const { lastReq } = <ApiBufferingState>getState().apiBuffering;

    // don't request the same location multiple times
    // this also ensures that you can go back from detail to search view without resetting apiBuffering.id to 0
    if (!forceReloading && lastReq !== null && lastReq.lat === pos.lat && lastReq.lon === pos.lon) {
      return;
    }
    dispatch(setLastRequest(pos));

    // reset the old facilities while we wait for the API
    // important: set facilities to null instead of [] since null means "still loading"
    dispatch(resetFacility());

    const facilities = await api.radiusSearch(pos, getState().globalState.includePlacesWithoutAccessibility);

    let index = 0;
    if (requestedId !== null) {
      const newFacilities = (<ApiBufferingState>getState().apiBuffering).facilities;
      let index_ = indexById(newFacilities!, requestedId);
      if (index_ !== null) {
        index = index_;
      }
    }
    dispatch(acCallback(facilities, index));

    if (index >= facilities.length) return;

    const { addresses, comments, images } = <ApiBufferingState>getState().apiBuffering;

    // Only request images once
    const id = facilities[index].features.id;
    if (images[api.idToStr(id)] === undefined) {
      const res = await api.getImages(id);
      dispatch(imageCallback(id, res));
    }

    if (comments[api.idToStr(id)] === undefined) {
      const res = await api.getComments(id);
      dispatch(commentsCallback(id, res));
    }

    if (addresses[api.idToStr(id)] === undefined) {
      const res = await api.posToAddress(facilities[index].features.coord);
      dispatch(addressCallback(id, res));
    }
  }
};

export const chooseFacility = (index: number) => {
  return async (dispatch: any, getState: any) => {
    dispatch(chooseFacilityCallback(index));

    // Now, load the facility image:

    const { facilities, addresses, comments, images } = <ApiBufferingState>getState().apiBuffering;

    // The facility has to exist
    if (facilities === null || facilities[index] === undefined) return;

    // Only request images once
    const id = facilities[index].features.id;
    if (images[api.idToStr(id)] === undefined) {
      const res = await api.getImages(id);
      dispatch(imageCallback(id, res));
    }

    if (comments[api.idToStr(id)] === undefined) {
      const res = await api.getComments(id);
      dispatch(commentsCallback(id, res));
    }

    if (addresses[api.idToStr(id)] === undefined) {
      const res = await api.posToAddress(facilities[index].features.coord);
      dispatch(addressCallback(id, res));
    }
  }
}

export const requestIncludePlacesWithoutAccessibility = (includePlacesWithoutAccessibility: boolean) => {
  return async (dispatch: any, getState: any) => {
    dispatch(setIncludePlacesWithoutAccessibility(includePlacesWithoutAccessibility));

    // reload the search
    const state = getState().apiBuffering;
    if (state.curFacility !== null) {
      dispatch(radiusSearch(state.lastReq, state.curFacility, true));
    }
  }
}

export const addComment = (content: string) => {
  return async (dispatch: any, getState: any) => {
    const { facilities, curFacility } = <ApiBufferingState>getState().apiBuffering;
    if (curFacility === null || facilities === null || facilities[curFacility!] === undefined) return;
    const facility = facilities[curFacility!];
    await api.addComment(facility.features.id, facility.features.coord, content);

    // reload comments
    const res = await api.getComments(facility.features.id);
    dispatch(commentsCallback(facility.features.id, res));
  }
}

export const updateFacilityData = (id: api.Id, attributes: api.Attributes) => {
  return async (dispatch: any, getState: any) => {
    const { facilities } = <ApiBufferingState>getState().apiBuffering;
    const facility = facilityById(facilities, id);

    if (facility === null || facility === undefined) return;

    const facilityUpdateObject = api.mapAttributesToDatabase(attributes);
    await api.updateAttributes(id, facility.features.coord, facilityUpdateObject);

    // add the data to the facility
    dispatch(updatAttributesCallback(id, attributes));
  }
}

// reducers
export const apiBuffering = (state: ApiBufferingState =
  {
    curFacility: null,
    facilities: null,
    images: {},
    comments: {},
    lastReq: null,
    addresses: {},
  }, action: any): ApiBufferingState => {
  switch (action.type) {
    case 'SET_LAST_REQUEST':
      return {
        ...state,
        lastReq: action.pos,
      }
    case 'AC_CALLBACK':
      return {
        ...state,
        facilities: action.facilities,
        curFacility: action.curFacility,
      };
    case 'CHOOSE_FACILITY_CALLBACK':
      if (api.inDebuggingMode()) {
        console.log('Chose facility ', state.facilities![action.curFacility])
      }
      return {
        ...state,
        curFacility: action.curFacility,
      };
    case 'IMAGE_CALLBACK':
      let images = { ...state.images };
      images[api.idToStr(action.id)] = action.facilityURLs;
      return {
        ...state,
        images,
      };
    case 'UPDATE_ATTRIBUTES_CALLBACK':
      if (state.facilities === null) return state;

      return {
        ...state,
        facilities: state.facilities.map((facility) => {
          if (facility.features.id.originalId === action.id.originalId && facility.features.id.sourceId === action.id.sourceId) {
            return {
              ...facility,
              attributes: action.attributes
            };
          } else {
            return facility;
          }
        })
      };
    case 'COMMENTS_CALLBACK':
      let comments = { ...state.comments };
      comments[api.idToStr(action.id)] = action.comments;
      return {
        ...state,
        comments,
      };
    case 'ADDRESS_CALLBACK':
      let addresses = { ...state.addresses };
      addresses[api.idToStr(action.id)] = action.address;
      return {
        ...state,
        addresses,
      };
    default:
      return state;
  }
};

export const globalState = (state: GlobalState =
  {
    fullscreen: false,
    includePlacesWithoutAccessibility: false,
  }, action: any): GlobalState => {
  switch (action.type) {
    case 'SET_FULLSCREEN':
      return {
        ...state,
        fullscreen: action.fullscreen,
      };
    case 'SET_INCLUDE_PLACES_WITHOUT_ACCESSIBILITY':
      return {
        ...state,
        includePlacesWithoutAccessibility: action.includePlacesWithoutAccessibility,
      };
    default:
      return state;
  }
};

export const reducers = combineReducers({
  apiBuffering,
  globalState,
});

// store
export function configureStore() {
  const store = createStore(reducers, applyMiddleware(thunk));
  return store;
};

export const store = configureStore();
