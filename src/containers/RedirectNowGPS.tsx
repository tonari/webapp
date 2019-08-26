import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { LinearProgress } from '@material-ui/core';

import Centered from '../components/Centered';
import commonStyles from './commonStyles.module.css';
import * as api from '../api';

enum GeoLocation {
  waitUser,
  waitLocation,
}

type State = {
  geoLocation: GeoLocation,
}

// Redirect to /now/<your GPS position>/
class RedirectNowGPS extends React.PureComponent<RouteComponentProps<{}>, State> {
  state = {
    geoLocation: GeoLocation.waitUser,
  }
  id: number | null = null;

  componentDidMount() {
    // the geolocation API is really ugly
    // https://stackoverflow.com/questions/3397585/navigator-geolocation-getcurrentposition-sometimes-works-sometimes-doesnt
    this.id = navigator.geolocation.watchPosition((location) => {
      const { latitude, longitude } = location.coords;
      // use replace instead of push, so that the native back button works (otherwise, you'll be redirected to this module again)
      this.props.history.replace(`/now/${latitude}_${longitude}`)
    }, (e: PositionError) => {
      if (api.inDebuggingMode()) {
        console.log('position error', e)
      }
      if (e.code == e.PERMISSION_DENIED) {
        this.setState({ geoLocation: GeoLocation.waitUser });
      } else if (e.code === e.TIMEOUT || e.code === e.POSITION_UNAVAILABLE) {
        this.setState({ geoLocation: GeoLocation.waitLocation });
      }
    }, {
        // force current locations only
        maximumAge: 0,
        enableHighAccuracy: true,
        // without setting the timeout, the whole request will be ignored on mobile Firefox
        timeout: 2000,
      });
  }

  componentWillUnmount() {
    if (this.id !== null) {
      navigator.geolocation.clearWatch(this.id);
    }
  }

  render() {
    let text = 'Please enable and allow location access.';

    if (this.state.geoLocation === GeoLocation.waitLocation) {
      text = 'Waiting for your location to become available.';
    }

    return (
      <React.Fragment>
        <LinearProgress />
        <Centered className={commonStyles.mainColumn}>{text}</Centered>
      </React.Fragment>
    );
  }
}

export default withRouter(RedirectNowGPS);
