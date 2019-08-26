import * as React from 'react';
import Typography from '@material-ui/core/Typography';

import Paper from '../components/Paper';
import * as api from '../api';
import Map from '../components/Map';
import commonStyles from '../containers/commonStyles.module.css';

type State = {
  facilityPos: api.Position | null,
  userPos: api.Position | null,
  userValidPos: api.Position | null,
  facilityName: string,
}

export default class Add extends React.Component<{}, State> {
  state = {
    facilityPos: null,
    userPos: null,
    userValidPos: null,
    facilityName: '',
  }
  id: number | null = null;

  updatePosition = () => {
    const { userValidPos } = this.state;
    if (userValidPos === null) return;

    this.setState({
      facilityPos: userValidPos,
    })
  }

  resetState = () => {
    this.setState({
      facilityPos: null,
      facilityName: '',
    });
  }

  newFacility = () => {
    const { facilityName, facilityPos } = this.state;
    if (facilityName.length === 0) {
      alert('Error: Facility name is empty');
      return;
    } else if (facilityPos === null) {
      alert('Error: Facility position is unknown');
      return;
    }

    api.createFacility(facilityName, facilityPos!);
    this.resetState();
    alert('Success');
  }

  componentDidMount() {
    this.id = navigator.geolocation.watchPosition((location) => {
      const { latitude, longitude } = location.coords;
      this.setState({
        userPos: {
          lat: latitude,
          lon: longitude,
        },
        userValidPos: {
          lat: latitude,
          lon: longitude,
        }
      });
    }, (e: PositionError) => {
      this.setState({
        userPos: null,
      });
    }, {
        maximumAge: 0,
        enableHighAccuracy: true,
        timeout: 2000,
      });
  }

  updateFacilityName = (e: any) => {
    this.setState({
      facilityName: e.target.value,
    });
  }

  componentWillUnmount() {
    if (this.id !== null) {
      navigator.geolocation.clearWatch(this.id);
    }
  }

  render() {
    const RenderPosition = (props: { title: string, pos: api.Position | null }) => {
      if (props.pos === null) {
        return (
          <Typography>
            <b>{props.title}</b> is unknown
                    </Typography>
        );
      } else {
        return (
          <Typography>
            <b>{props.title}</b>:<br />lat = {props.pos.lat}, lon = {props.pos.lon}
          </Typography>
        );
      }
    }

    return (
      <div className={commonStyles.mainColumn}>
        <div className={commonStyles.columnLayout}>
          <Map pos={this.state.facilityPos} />
          <Paper className={commonStyles.mainColumn}>
            <Typography>Name:</Typography>
            <input value={this.state.facilityName} onChange={e => this.updateFacilityName(e)} style={{ width: '100%' }} />
            <RenderPosition title='Your current position' pos={this.state.userPos} />
            <RenderPosition title='Your last valid position' pos={this.state.userValidPos} />
            <RenderPosition title='Facility position' pos={this.state.facilityPos} />
            <button onClick={this.updatePosition}>Update facility position with your last valid position</button> <button onClick={this.newFacility}>Add new facility</button>
          </Paper>
        </div>
      </div>
    );
  }
};
