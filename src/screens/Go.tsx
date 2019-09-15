import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom'
import Typography from '@material-ui/core/Typography';
import MobileStepper from '@material-ui/core/MobileStepper';
import ArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import DirectionsIcon from '@material-ui/icons/DirectionsOutlined';
import EditIcon from '@material-ui/icons/Edit';
import classNames from 'classnames';

import { ApiBufferingState, radiusSearch, addComment } from '../redux';
import AttributeList from '../components/AttributeList';
import Centered from '../components/Centered';
import commonStyles from '../containers/commonStyles.module.css';
import { facilityById, generateMapsUrl } from '../common';
import EmptyWaitingScreen from '../components/EmptyWaitingScreen';
import * as api from '../api';
import detailStyles from './Detail.module.css';
import styles from './Go.module.css';
import Map from '../components/Map';
import SwipeView from '../components/SwipeView';
import SwipeResistibleOverflow from '../components/SwipeResistibleOverflow';
import SwipeResistibleLink from '../components/SwipeResistibleLink';
import Comments from '../containers/Comments';
import ImageUpload from '../components/ImageUpload';

type State = {
  index: number,
  commentContent: string,
}

type Match = {
  id: string,
  pos: string,
}

type Props = {
  facilities: ApiBufferingState['facilities'],
  radiusSearch: typeof radiusSearch,
  addComment: typeof addComment,
  comments: ApiBufferingState['comments'],
  addresses: ApiBufferingState['addresses'],
}

class Go extends React.PureComponent<RouteComponentProps<Match> & Props, State> {
  swipeView: SwipeView | null = null;

  state = {
    index: 0,
    commentContent: '',
  }

  getId(): api.Id {
    return api.idFromStr(this.props.match.params.id);
  }

  // the facility that is currently displayed in this screen
  getFacility = (): api.Facility | null => {
    return facilityById(this.props.facilities, this.getId());
  }

  onChange = async (e: any) => {
    if (e.target.files === null || e.target.files.length === 0) return;

    const facility = this.getFacility();
    if (facility === null) return;

    const url = URL.createObjectURL(e.target.files[0]);
    await api.uploadImage(facility, url);
    URL.revokeObjectURL(url);
  }

  render() {
    if (this.props.facilities === null) {
      // the page was refreshed and thus no facilities were loaded so far

      const pos = api.positionFromStr(this.props.match.params.pos);
      this.props.radiusSearch(pos, this.getId());

      return <EmptyWaitingScreen />;
    }

    const facility = this.getFacility();

    if (facility === null) {
      return <Centered className={commonStyles.mainColumn}>Internal error. This shouldn't have happened.</Centered>;
    }

    const address = (() => {
      const adr = this.props.addresses[api.idToStr(this.getId())];
      if (adr == undefined) {
        return 'loading...';
      } else if (adr === null) {
        return <i>No address found</i>;
      } else {
        return adr;
      }
    })();

    return (
      <div className={commonStyles.mainColumn}>
        <div className={commonStyles.columnLayout}>
          <div className={commonStyles.mainColumn}>
            <div className={styles.allAttributesScreenOutter}>
              <div className={classNames(styles.allAttributesScreenInner, commonStyles.columnLayout)}>
                <div className={commonStyles.columnLayout}>
                  <Map
                    className={styles.map}
                    pos={facility.features.coord}
                    touchMove={() => {
                      if (!this.swipeView) return;
                      this.swipeView.abortSwiping();
                    }}
                  />

                  <div className={styles.detailContainer}>
                    <div className={styles.arrowContainer}>
                      <SwipeResistibleLink to={`/now/${this.props.match.params.pos}/${this.props.match.params.id}`}>
                        <ArrowLeftIcon className={classNames(styles.arrowLeftIcon, commonStyles.icon)} />
                      </SwipeResistibleLink>
                    </div>

                    <div className={styles.detail}>
                      <Typography className={styles.distance}>{facility.features.distance}m</Typography>
                      <Typography className={styles.name}>{facility.features.name}</Typography>
                      <Typography className={styles.address}>
                        {address}
                      </Typography>
                    </div>
                    <div className={styles.iconsContainer}>
                      {this.state.index === 1 &&
                        <SwipeResistibleLink to={`/now/${this.props.match.params.pos}/${this.props.match.params.id}/go/edit`}>
                          <EditIcon className={commonStyles.icon} />
                        </SwipeResistibleLink>
                      }
                      <ImageUpload facility={this.getFacility()}></ImageUpload>
                      <SwipeResistibleLink
                        to={generateMapsUrl(facility.features.coord, facility.features.name || 'Toilet').url}
                        external
                      >
                        <DirectionsIcon className={classNames(commonStyles.icon, styles.directionsIcon)} />
                      </SwipeResistibleLink>
                    </div>
                  </div>

                  <SwipeView
                    index={this.state.index}
                    onChangeIndex={(index: number) => this.setState({ index })}
                    className={commonStyles.mainColumn}
                    mode={'swipe'}
                    ref={(ele) => this.swipeView = ele}
                  >
                    <div className={`${commonStyles.columnLayout} ${detailStyles.commentScreen}`}>
                      <Comments swipeView={this.swipeView} id={facility.features.id} />
                    </div>
                    <div className={commonStyles.columnLayout}>
                      <div className={commonStyles.mainColumn}>
                        <SwipeResistibleOverflow swipeView={this.swipeView}>
                          <AttributeList detailScreen attributes={facility.attributes} />
                        </SwipeResistibleOverflow>
                      </div>
                    </div>
                  </SwipeView>
                  <React.Fragment>
                    <MobileStepper
                      steps={2}
                      position='static'
                      activeStep={this.state.index}
                      backButton={<React.Fragment />}
                      nextButton={<React.Fragment />}
                      className={detailStyles.stepper} />
                  </React.Fragment>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    );
  }
}

const mapStateToProps = (state: any) => ({
  facilities: state.apiBuffering.facilities,
  comments: state.apiBuffering.comments,
  addresses: state.apiBuffering.addresses,
});

const mapDispatchToProps = {
  radiusSearch,
  addComment,
};

export default connect<{}, {}, Props>(
  mapStateToProps,
  mapDispatchToProps,
)(Go);
