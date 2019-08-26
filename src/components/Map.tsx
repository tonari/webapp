import * as React from 'react';
import mapboxgl from 'mapbox-gl';

import * as api from '../api';

// I didn't find any Mapbox React wrapper that supported the GeolocateControl feature, so I wrote my own React component
// This file is based on https://github.com/mapbox/mapbox-react-examples/tree/master/basic

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN as any;

type Props = {
  pos: api.Position | null,
  className?: string,
  touchMove?: () => void,
};

export default class Map extends React.Component<Props, {}> {
  container: React.RefObject<HTMLDivElement>;
  // Mapbox's map object
  map: any = null;
  ctrl: any = null;
  marker: any = null;

  constructor(props: Props) {
    super(props);

    this.container = React.createRef();
  }

  timer: any = null;
  maxTries: number = 20;
  tries: number = 0;
  timeout = () => {
    if (this.map) {
      // without this fix, setting the width to 100% doesn't work
      this.map.resize();
    }

    // for some reason we cannot call .trigger() directly without a timeout
    const res = this.ctrl.trigger();

    if (res || this.tries >= this.maxTries) {
      clearTimeout(this.timer);
    }

    this.tries++;
  }

  setMarker = () => {
    if (this.props.pos === null) return;

    this.marker = new mapboxgl.Marker()
      .setLngLat(this.props.pos)
      .addTo(this.map);
  }

  updateMarker = () => {
    if (this.marker !== null) {
      this.marker.remove();
    }
    this.setMarker();
  }

  componentDidMount() {
    let opt: any = {
      container: this.container.current as any,
      style: 'mapbox://styles/mapbox/light-v10',
      zoom: 3,
    };

    if (this.props.pos !== null) {
      opt.center = this.props.pos;
    }

    this.map = new mapboxgl.Map(opt);

    // The touchstart event is issued before the mousedown event from the SwipeView which is why abortSwiping doesn't work.
    // Thus use touchmove instead of touchstart.
    if (this.props.touchMove !== undefined) {
      this.map.on('touchmove', this.props.touchMove);
    }

    this.map.addControl(new mapboxgl.FullscreenControl());

    this.ctrl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    });
    this.map.addControl(this.ctrl);

    this.map.addControl(new mapboxgl.NavigationControl({
      showZoom: false,
      showCompass: true,
    }));

    this.timer = setTimeout(this.timeout, 100);
    this.setMarker();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.pos !== prevProps.pos) {
      this.updateMarker();
    }
  }

  componentWillUnmount() {
    if (this.map !== null) {
      this.map.remove();
      this.map = null;
    }
  }

  render() {
    return <div ref={this.container} className={this.props.className !== undefined ? this.props.className : ''}></div>;
  }
};
