import UAParser from 'ua-parser-js';

import * as api from './api';

export function facilityById(facilities: api.Facility[] | null, id: api.Id): any | null {
  if (facilities === null) return null;
  let index = indexById(facilities, id);

  if (index !== null) {
      return facilities[index];
  }

  return null;
}

export function indexById(facilities: api.Facility[], id: api.Id): number | null {
  for (let index in facilities) {
    const facility = facilities[index];
    const curId = facility.features.id;
    if (curId.sourceId === id.sourceId && curId.originalId === id.originalId) {
      return parseInt(index);
    }
  }
  return null;
}

// see https://developer.android.com/guide/components/intents-common#Maps
function generateGeoUrl(position: api.Position, placeName: string) {
  return `geo:${position.lat},${position.lon}?q=${position.lat},${position.lon}(${encodeURIComponent(
    placeName
  )})`;
}

// see https://developer.apple.com/library/content/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html
function generateAppleMapsUrl(position: api.Position, placeName: string) {
  return `http://maps.apple.com/?ll=${position.lat},${position.lon}&q=${encodeURIComponent(placeName)}`;
}

// see https://docs.microsoft.com/en-us/previous-versions/windows/apps/jj635237(v=win.10)
function generateBingMapsUrl(position: api.Position, placeName: string) {
  return `bingmaps:?collection=point.${position.lat}_${position.lon}_${encodeURIComponent(placeName)}`;
}

function generateOsmUrl(position: api.Position, placeName: string) {
  return `https://www.openstreetmap.org/?mlat=${position.lat}&mlon=${position.lon}&zoom=17&layers=M#map=19/${position.lat}/${position.lon}`;
}


export interface UserAgent {
  ua: string,
  browser: { name: string, version: string },
  device: { model: string, type: string, vendor: string },
  engine: { name: string, version: string }
  os: { name: string, version: string }
  cpu: { architecture: string }
}

export function getUserAgent(): UserAgent {
  return UAParser(navigator.userAgent);
}

export function generateMapsUrl(position: api.Position, placeName: string) {
  const osName = getUserAgent().os.name;

  if (osName) {
    const isBingMaps = osName.match(/^Windows/);
    const isAppleMaps = osName === 'Mac OS' || osName === 'iOS';
    const isAndroid = osName === 'Android';

    if (isBingMaps) {
      const caption = 'Bing Maps';
      return { url: generateBingMapsUrl(position, placeName), caption };
    }

    if (isAppleMaps) {
      const caption = 'Apple Maps';
      return { url: generateAppleMapsUrl(position, placeName), caption };
    }

    if (isAndroid) {
      const caption = 'Maps app';
      return { url: generateGeoUrl(position, placeName), caption };
    }
  }

  const caption = 'OpenStreetMap';
  return { url: generateOsmUrl(position, placeName), caption };
}

export async function getPushSubscription() {
  return navigator.serviceWorker.getRegistration()
    .then((registration) =>
      registration!.pushManager.getSubscription()
        .then((subscription) =>
          subscription
        )
    );
}
