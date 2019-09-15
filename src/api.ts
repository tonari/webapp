// This API provides an interface for all aggregated information
// The App is basically just a GUI for this API

import loadImage from 'blueimp-load-image';
import objectAssignDeep from 'object-assign-deep';

import { getPushSubscription } from './common';
import moment from 'moment';

var requireEnv = require("require-environment-variables");

requireEnv([
  'REACT_APP_ACCESSIBILITY_CLOUD_TOKEN',
  'REACT_APP_WHEELMAP_TOKEN',
  'REACT_APP_MAPBOX_TOKEN',
  'REACT_APP_MAPQUEST_TOKEN',
  'REACT_APP_BACKEND_URL',
]);

export interface Position {
  lat: number; // latitude
  lon: number; // longitude
}

export function positionToStr(pos: Position): string {
  return pos.lat + '_' + pos.lon;
}

export function positionFromStr(pos: string): Position {
  const l = pos.split('_');
  return {
    lat: parseFloat(l[0]),
    lon: parseFloat(l[1]),
  };
}

export interface Id {
  sourceId: string;
  // the id of a data point inside the original source
  originalId: string;
}

// map an Id to a string (which is usable as an index for an object)
export function idToStr(id: Id): string {
  return id.sourceId + ' ' + id.originalId;
}

export function idFromStr(id: string): Id {
  const l = id.split(' ');
  return {
    sourceId: l[0],
    originalId: l[1],
  };
}

function paramExists(param: string) {
  return new URLSearchParams(window.location.search).get(param) !== null;
}

export function inDebuggingMode(): Boolean {
  return paramExists('debugging');
}

export function inExperimentalMode(): Boolean {
  return paramExists('experimental');
}

export function inPresentingMode(): Boolean {
  return paramExists('presenting');
}

export function getSearchLocation(): String | null {
  if (typeof process.env.REACT_APP_OVERWRITE_SEARCH_LOCATION == 'undefined') {
    return null;
  } else {
    return process.env.REACT_APP_OVERWRITE_SEARCH_LOCATION;
  }
}

export function getBackendUrl(): String {
  let url = process.env.REACT_APP_BACKEND_URL!;
  if (url[url.length - 1] != '/') {
    url += '/';
  }
  return url;
}

let caughtBlockedDomainError = false;

// catch an error message in Firefox
function fetchCatchBlockedDomainError(url: string, opts: { [key: string]: any }) {
  const res = fetch(url, opts).catch((e: Error) => {
    if (e instanceof TypeError && e.message === 'NetworkError when attempting to fetch resource.') {
      // see in the console and you should see the following message:
      // Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://tonari.app/wheelmap/api/XXXXX. (Reason: CORS request did not succeed).[Learn More]
      if (!caughtBlockedDomainError) {
        caughtBlockedDomainError = true;
        alert('Please whitelist all domains that this website uses in your JavaScript blocker.')
      }
    }
    throw e;
  });
  // Since we always throw, it doesn't matter that the catch function doesn't return anything: Due to the control flow of throws, it's not to possible to access the return value if we throw.
  return res as Promise<Response>;
}

type SearchParams = { [key: string]: string };

async function getJsonAc(path: string, params: SearchParams = {}) {
  let url = new URL(`https://accessibility-cloud.freetls.fastly.net/${path}.json`);
  for (let param in params) {
    url.searchParams.set(param, params[param]);
  }
  return fetchCatchBlockedDomainError(url.href, {
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'X-App-Token': process.env.REACT_APP_ACCESSIBILITY_CLOUD_TOKEN,
    }
  });
}

async function getJsonWm(path: string, params: SearchParams = {}) {
  // Problem: Wheelmap doesn't use CORS headers :(
  // let url = new URL(`https://wheelmap.org/api/${path}`);
  let url = new URL(`https://tonari.app/wheelmap/api/${path}`);
  for (let param in params) {
    url.searchParams.set(param, params[param]);
  }

  url.searchParams.set('api_key', process.env.REACT_APP_WHEELMAP_TOKEN as any);

  return fetchCatchBlockedDomainError(url.href, {
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
    }
  });
}

async function getJsonBackend(path: string, params: SearchParams = {}) {
  let url = new URL(`${getBackendUrl()}${path}`);
  for (let param in params) {
    url.searchParams.set(param, params[param]);
  }

  return fetchCatchBlockedDomainError(url.href, {
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
    }
  });
}

export interface Attributes {
  [key: string]: string | boolean | undefined;
  wheelchairAccess?: 'noSteps' | 'oneStep' | 'multipleSteps',
  facilityType?: 'public' | 'private',
  isOpen?: boolean,
  fee?: boolean,
  gender?: 'female' | 'male' | 'unisex',
  key?: 'euroKey' | 'radarKey' | 'askStaff' | 'none',
  spacious?: boolean,
  grabRail?: 'left' | 'right' | 'both' | 'none',
  lateralAccess?: boolean,
  bottomClearance?: boolean,
  sinkInsideCabin?: boolean,
  reachableControls?: boolean,
  emergencyCall?: boolean,
  shower?: boolean,
}

export interface Facility {
  attributes: Attributes,
  features: {
    coord: Position,
    distance: number,
    name: string,
    id: Id,
  }
}

export function isAttributeBoolean(attribute: string): boolean {
  return [
    'isOpen',
    'fee',
    'spacious',
    'lateralAccess',
    'bottomClearance',
    'sinkInsideCabin',
    'reachableControls',
    'emergencyCall',
    'shower',
  ].includes(attribute);
}

export const editableAttributeToText: { [key: string]: string } = {
  'wheelchairAccess': 'Wheelchair-Accessible',
  'gender': 'Gender',
  'facilityType': 'Facility Type',
  'key': 'Key',
  'fee': 'Fee',
  'spacious': 'Spacious',
  'grabRail': 'Grab Rail',
  'lateralAccess': 'Lateral Access',
  'bottomClearance': 'Bottom Clearance',
  'sinkInsideCabin': 'Sink Inside Cabin',
  'reachableControls': 'Reachable Controls',
  'emergencyCall': 'Emergency Call',
  'shower': 'Shower',
}

export const validAttributeValues: { [key: string]: string[][] } = {
  'wheelchairAccess': [['noSteps', 'No Steps'], ['oneStep', 'One Step'], ['multipleSteps', 'Multiple Steps']],
  'facilityType': [['public', 'Public'], ['private', 'Private']],
  'gender': [['female', 'Female'], ['male', 'Male'], ['unisex', 'Unisex']],
  'key': [['euroKey', 'Euro-Key'], ['radarKey', 'Radar-Key'], ['askStaff', 'Ask Staff'], ['none', 'None']],
  'grabRail': [['both', 'Left and Right'], ['left', 'Left'], ['right', 'Right'], ['none', 'None']]
}

export const attributeValueToText: { [key: string]: { [key: string]: string } } = {
  'isOpen': {
    'undefined': 'Opening Hours',
    'true': 'Open Now',
    'false': 'Closed'
  },
  'wheelchairAccess': {
    'undefined': 'Wheelchair-Accessible',
    'noSteps': 'No Steps',
    'oneStep': 'One Step',
    'multipleSteps': 'Multiple Steps',
  },
  'gender': {
    'undefined': 'Gender',
    'female': 'Female',
    'male': 'Male',
    'unisex': 'Unisex'
  },
  'facilityType': {
    'undefined': 'Facility Type',
    'public': 'Public',
    'private': 'Private'
  },
  'key': {
    'undefined': 'Key',
    'euroKey': 'Euro-key',
    'radarKey': 'Radar-key',
    'askStaff': 'Ask Staff',
    'none': 'No Key'
  },
  'fee': {
    'undefined': 'Fee',
    'true': 'Fee',
    'false': 'Fee',
  },
  'spacious': {
    'undefined': 'Spacious',
    'true': 'Spacious',
    'false': 'Spacious'
  },
  'grabRail': {
    'undefined': 'Grab Rail',
    'both': 'Grab Rail (L&R)',
    'left': 'Grab Rail (L)',
    'right': 'Grab Rail (R)',
    'none': 'No Grab Rail'
  },
  'lateralAccess': {
    'undefined': 'Lateral Access',
    'true': 'Lateral Access',
    'false': 'Lateral Access'
  },
  'bottomClearance': {
    'undefined': 'Bottom Clearance',
    'true': 'Bottom Clearance',
    'false': 'Bottom Clearance'
  },
  'sinkInsideCabin': {
    'undefined': 'Sink Inside Cabin',
    'true': 'Sink Inside Cabin',
    'false': 'Sink Inside Cabin'
  },
  'reachableControls': {
    'undefined': 'Reachable Controls',
    'true': 'Reachable Controls',
    'false': 'Reachable Controls'
  },
  'emergencyCall': {
    'undefined': 'Emergency Call',
    'true': 'Emergency Call',
    'false': 'Emergency Call'
  },
  'shower': {
    'undefined': 'Shower',
    'true': 'Shower',
    'false': 'Shower'
  }
}

export const attributeToDatabasePath: { [key: string]: string[] } = {
  'wheelchairAccess': ['properties', 'accessibility', 'accessibleWith', 'wheelchair'],
  'gender': ['properties', 'accessibility', 'gender'],
  'facilityType': ['properties', 'accessibility', 'facilityType'],
  'key': ['properties', 'accessibility', 'key'],
  'fee': ['properties', 'accessibility', 'fee'],
  'spacious': ['properties', 'accessibility', 'spacious'],
  'grabRail': ['properties', 'accessibility', 'grabRail'],
  'lateralAccess': ['properties', 'accessibility', 'lateralAccess'],
  'bottomClearance': ['properties', 'accessibility', 'bottomClearance'],
  'sinkInsideCabin': ['properties', 'accessibility', 'sinkInsideCabin'],
  'reachableControls': ['properties', 'accessibility', 'reachableControls'],
  'emergencyCall': ['properties', 'accessibility', 'emergencyCall'],
  'shower': ['properties', 'accessibility', 'shower']
}

export function mapAttributesToDatabase(attributes: Attributes): any {
  let result = {};
  attributes = { ...attributes };
  delete attributes.isOpen;
  for (const attr in attributes) {
    var currentAttribute: any = {};
    var currentPath = currentAttribute;
    for (let i = 0; i < attributeToDatabasePath[attr].length - 1; ++i) {
      const pathComponent = attributeToDatabasePath[attr][i];
      currentPath[pathComponent] = {};
      currentPath = currentPath[pathComponent];
    }
    currentPath[attributeToDatabasePath[attr][attributeToDatabasePath[attr].length - 1]] = attributes[attr];
    objectAssignDeep(result, currentAttribute);
  };
  return result;
}

const radius = 1000;

export async function radiusSearch(pos: Position, includePlacesWithoutAccessibility: boolean): Promise<Facility[]> {
  let req: any = {
    latitude: pos.lat.toString(),
    longitude: pos.lon.toString(),
    accuracy: radius.toString(),
    includeCategories: 'toilets',
    includePlacesWithoutAccessibility: includePlacesWithoutAccessibility ? '1' : '0',
  }
  if (inDebuggingMode()) {
    req.includeRelated = 'source';
  }
  const reqAc = getJsonAc('place-infos', req);
  const reqBackend = getJsonBackend(`facilities/by-radius/${pos.lon}/${pos.lat}/${radius}`);

  const dataAc = await (await reqAc).json();
  const dataBackend = await (await reqBackend).json();

  function deriveFacilityFromAcFormat(features: any): Facility {
    const props = features.properties;

    let facility: any = {
      attributes: {},
      features: {},
    };

    if (props.accessibility !== undefined && props.accessibility.accessibleWith !== undefined && props.accessibility.accessibleWith.wheelchair !== undefined) {
      switch (props.accessibility.accessibleWith.wheelchair) {
        case true:
          facility.attributes.wheelchairAccess = 'noSteps';
          break;
        case false:
          facility.attributes.wheelchairAccess = 'multipleSteps';
          break;
        case 'noSteps':
          facility.attributes.wheelchairAccess = 'noSteps';
          break;
        case 'oneStep':
          facility.attributes.wheelchairAccess = 'oneStep';
          break;
        case 'multipleSteps':
          facility.attributes.wheelchairAccess = 'multipleSteps';
          break;
      }
    }

    if (!('public' in facility.attributes) && props.name && (props.name.indexOf('Öffentliche Toilette') > -1 || props.name === 'City Toilette')) {
      facility.attributes.facilityType = 'public';
    }

    for (let attr in attributeToDatabasePath) {
      if (attr === 'wheelchairAccess') {
        // Wheelchair access is handled above specially, because it needs to deal with both string and boolean values
        continue;
      }

      let currentPath = features;
      for (let i = 0; i < attributeToDatabasePath[attr].length; ++i) {
        const pathComponent = attributeToDatabasePath[attr][i];
        if (currentPath === undefined) {
          break;
        }
        currentPath = currentPath[pathComponent];
      }
      if (currentPath === undefined) {
        continue;
      }

      facility.attributes[attr] = currentPath;
    }

    if (features.geometry.coordinates !== undefined) {
      facility.features.coord = {
        lon: features.geometry.coordinates[0],
        lat: features.geometry.coordinates[1],
      }
    }

    if (props.distance !== undefined) {
      facility.features.distance = Math.round(props.distance);
    }

    if (props.name !== undefined) {
      facility.features.name = props.name;
    }

    if (props.sourceId !== undefined && props.originalId !== undefined) {
      facility.features.id = {
        sourceId: props.sourceId,
        originalId: props.originalId,
      };
    }

    facility.attributes.isOpen = true;

    return facility;
  }

  // our backend overwrites all features from the AC if they exist
  function transformBackend(dataAc: Facility[], dataBackend: any): Facility[] {
    if (dataBackend.result !== 'success' || dataBackend.featureCount === 0) return dataAc;

    function findBackendEntryInAC(haystack: Facility[], needle: any): number | null {
      for (let index in haystack) {
        const hay = haystack[index];
        if (hay.features.id.sourceId === needle.properties.sourceId &&
          hay.features.id.originalId === needle.properties.originalId) {
          return parseInt(index);
        }
      }
      return null;
    }

    for (let index in dataBackend.features) {
      const entry = dataBackend.features[index];
      const acIndex = findBackendEntryInAC(dataAc, entry);
      const derived = deriveFacilityFromAcFormat(entry);
      if (acIndex === null) {
        // entry that is in the backend but not in the AC
        dataAc.push(derived);
      } else {
        // overwrite data
        objectAssignDeep(dataAc[acIndex], derived);
      }
    }

    return dataAc;
  }

  function sortByDistance(a: Facility, b: Facility) {
    return a.features.distance - b.features.distance;
  }

  const facilities: Facility[] = transformBackend(dataAc.features.map(deriveFacilityFromAcFormat), dataBackend).sort(sortByDistance);

  return facilities;
}

export async function getImages(id: Id): Promise<string[]> {
  const wheelmapSourceId = 'LiBTS67TjmBcXdEmX';

  const onlyWheelmap = async (f: Function) => {
    if (id.sourceId !== wheelmapSourceId) return [];
    return f();
  }

  const resWm = onlyWheelmap(() => getJsonWm(`nodes/${id.originalId}/photos`).then(async res => {
    if (!res.ok) return [];
    const data = await res.json();

    return data.photos.map((photo: any) => {
      let images = photo.images.filter((img: any) => img.type && img.type == 'gallery_ipad');
      if (images.length > 0) {
        return images[0].url;
      }
    }).filter((img: any) => img !== undefined);
  }));

  const resAc = onlyWheelmap(() => getJsonAc('images', {
    context: 'place',
    objectId: id.originalId,
  }).then(async res => {
    if (!res.ok) return [];
    const data = await res.json();

    if (data.images === undefined) return [];

    return data.images.map((img: any) => img.url);
  }));

  const resBackend = getJsonBackend(`facilities/by-id/${id.sourceId}/${id.originalId}`).then(async res => {
    if (!res.ok) return [];
    const data = await res.json();

    if (data.result !== 'success' || data.featureCount === 0) return [];

    if (data.features[0].properties.images === undefined) return [];

    return data.features[0].properties.images.map((photo: any) => photo.url);
  });

  const imgsWm = await resWm;
  const imgsAc = await resAc;
  const imgsBackend = await resBackend;

  return imgsAc.concat(imgsWm, imgsBackend);
}

// Mapquest runs a Nominatim (https://wiki.openstreetmap.org/wiki/Nominatim) server which has the best free usage policy.
export async function posToAddress(pos: Position): Promise<string | null> {
  const url = new URL(`https://open.mapquestapi.com/nominatim/v1/reverse.php?key=${process.env.REACT_APP_MAPQUEST_TOKEN}&format=jsonv2&lat=${pos.lat}&lon=${pos.lon}&accept-language=de`);
  const res = await fetchCatchBlockedDomainError(url.href, {
    mode: 'cors',
  });

  const { address } = await res.json();

  if (address && address.road && address.house_number) {
    return `${address.road} ${address.house_number}`;
  } else if (address && address.road) {
    return address.road;
  } else if (address && address.pedestrian) {
    return address.pedestrian;
  } else if (address && address.footway) {
    return address.footway;
  } else {
    return null;
  }
}

// Downscale and compress the image for a faster upload.
// Also convert the image to JPG since the backend only accepts JPGs.
export function uploadImage(facility: Facility, url: string) {
  return new Promise(resolve => {
    const doFetch = (blob: Blob | null) => {
      if (blob === null) return;

      let formData = new FormData();
      formData.append('image', blob);

      const { coord, id } = facility.features;

      fetch(`${getBackendUrl()}images/upload/${id.sourceId}/${id.originalId}?lat=${coord.lat}&lon=${coord.lon}`, {
        method: 'post',
        body: formData,
      });

      resolve();
    };

    const toBlob = (canvas: any) => {
      const quality = 0.85;
      canvas.toBlob(doFetch, 'image/jpeg', quality);
    }

    const opts = {
      maxWidth: 1024,
      maxHeight: 1024,
      contain: true,
      canvas: true,
      orientation: true,
    };

    loadImage(url, toBlob, opts);
  });
}

export function createFacility(name: string, pos: Position) {
  fetch(`${getBackendUrl()}facilities/set-facility`, {
    method: 'post',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      createNewFacility: true,
      lat: pos.lat,
      lon: pos.lon,
      name,
    })
  });
}

export function willVisit(id: Id, search: Position) {
  fetch(`${getBackendUrl()}facilities/will-visit`, {
    method: 'post',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      id,
      search: {
        lat: search.lat,
        lon: search.lon,
        radius,
      },
    })
  });
}

export function flagImage(id: Id, imageId: string) {
  fetch(`${getBackendUrl()}images/flag-image`, {
    method: 'post',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      id,
      imageId,
    })
  });
}

export async function addComment(id: Id, pos: Position, content: string) {
  await fetch(`${getBackendUrl()}facilities/add-comment`, {
    method: 'post',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      id,
      lat: pos.lat,
      lon: pos.lon,
      content,
    })
  });
}

export async function updateAttributes(id: Id, pos: Position, attributes: any) {
  await fetch(`${getBackendUrl()}facilities/set-facility`, {
    method: 'post',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      createNewFacility: false,
      id,
      lat: pos.lat,
      lon: pos.lon,
      name: attributes.properties.name,
      address: attributes.properties.address,
      accessibility: attributes.properties.accessibility
    })
  });
}

export interface Comment {
  id: string;
  content: string;
  timestamp: moment.Moment;
}

export async function getComments(id: Id): Promise<Comment[]> {
  return await fetch(`${getBackendUrl()}facilities/by-id/${id.sourceId}/${id.originalId}`).then(async res => {
    if (!res.ok) return [];
    const data = await res.json();

    if (data.result !== 'success' || data.featureCount === 0) return [];

    if (data.features[0].properties.comments === undefined) return [];

    return data.features[0].properties.comments.map((comment: any) => {
      return {
        id: comment.id,
        content: comment.content,
        timestamp: moment.utc(comment.timestamp, 'YYYY-MM-DD HH:mm:ss.SSS UTC'),
      }
    });
  });
}
