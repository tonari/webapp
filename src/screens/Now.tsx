import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom'
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import MoreIcon from '@material-ui/icons/MoreVert';
import BackIcon from '@material-ui/icons/ArrowBack';
import ArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import Switch from '@material-ui/core/Switch';
import classNames from 'classnames';

import { ApiBufferingState, chooseFacility, radiusSearch, requestIncludePlacesWithoutAccessibility } from '../redux';
import AttributeList from '../components/AttributeList';
import SwipeView from '../components/SwipeView';
import FacilityGallery from '../containers/FacilityGallery';
import SwipeResistibleLink from '../components/SwipeResistibleLink';
import commonStyles from '../containers/commonStyles.module.css';
import styles from './Now.module.css';
import Centered from '../components/Centered';
import Swipeout from '../components/Swipeout';
import EmptyWaitingScreen from '../components/EmptyWaitingScreen';
import * as api from '../api';

type SwipeViewReduxProviderProps = {
  curFacility?: number | null,
  chooseFacility?: typeof chooseFacility,
  swipeView(ele: SwipeView | null): any
}

class SwipeViewReduxProvider_ extends React.PureComponent<SwipeViewReduxProviderProps, {}> {
  swipeView: SwipeView | null = null;

  onChangeIndex = (pos: number) => {
    this.props.chooseFacility!(pos);
  }

  render() {
    if (this.props.children === null || this.props.children === undefined) {
      return null;
    }

    const first = this.props.curFacility! === 0;
    const last = this.props.curFacility! === (this.props.children as React.ReactNodeArray).length - 1;

    const style = (() => {
      const id = this.props.curFacility!;
      if (first) {
        return '.mainswipeview>*:nth-child(1)>*, .mainswipeview>*:nth-child(2)>* { display: block; }';
      } else if (last) {
        return `.mainswipeview>*:nth-child(${id})>*, .mainswipeview>*:nth-child(${id + 1})>* { display: block; }`;
      } else {
        return `.mainswipeview>*:nth-child(${id})>*, .mainswipeview>*:nth-child(${id + 1})>*, .mainswipeview>*:nth-child(${id + 2})>* { display: block; }`;
      }
    })();

    return (
      <React.Fragment>
        <style dangerouslySetInnerHTML={{ __html: `.mainswipeview>*>* { display: none; } ${style as string}` }} />

        <SwipeView
          index={this.props.curFacility!}
          onChangeIndex={this.onChangeIndex}
          className={classNames('mainswipeview', commonStyles.mainColumn, styles.swipeContainer)}
          mode={'swipe'}
          ref={this.props.swipeView}
        >
          {this.props.children}
        </SwipeView>
      </React.Fragment>
    );
  }
}

const mapStateToProps_ = (state: any) => ({
  curFacility: state.apiBuffering.curFacility,
});

const mapDispatchToProps_ = {
  chooseFacility,
};

const SwipeViewReduxProvider = connect<{}, {}, SwipeViewReduxProviderProps>(
  mapStateToProps_,
  mapDispatchToProps_,
)(SwipeViewReduxProvider_)

type Props = {
  facilities: ApiBufferingState['facilities'],
  radiusSearch: typeof radiusSearch,
  requestIncludePlacesWithoutAccessibility: typeof requestIncludePlacesWithoutAccessibility,
  includePlacesWithoutAccessibility: boolean,
};

type Match = {
  pos: string,
}

type WholeProps = RouteComponentProps<Match> & Props;

class Now extends React.Component<WholeProps, {}> {
  swipeView: SwipeView | null = null;
  backendPictureId: string | null = null;

  updatePosition = () => {
    this.props.radiusSearch(api.positionFromStr(this.props.match.params.pos));
  }

  componentDidMount() {
    this.updatePosition();
  }

  shouldComponentUpdate(nextProps: WholeProps) {
    // exclude props.match from here
    const changedProps =
      this.props.facilities !== nextProps.facilities
      || this.props.includePlacesWithoutAccessibility != nextProps.includePlacesWithoutAccessibility;

    if (changedProps) return true;

    // don't rerender if the position changed but issue a rendering through the radiusSearch
    if (this.props.match.params.pos !== nextProps.match.params.pos) {
      this.updatePosition();
    }

    return false;
  }

  facilityGalleryOnChangeIndex = (url: string) => {
    this.backendPictureId = null;

    const backend_prefix = api.getBackendUrl() + 'images/';
    if (url.indexOf(backend_prefix) !== -1) {
      this.backendPictureId = url.substr(backend_prefix.length);
    }
  };

  render() {
    const createElement = (facility: api.Facility) => {
      const goToDetail = () => {
        this.props.history.push(`/now/${this.props.match.params.pos}/${api.idToStr(facility.features.id)}`);
      }

      return (
        <div
          className={classNames(commonStyles.columnLayout, styles.facilityContainer)}
          key={api.idToStr(facility.features.id)}
        >
          <div className={commonStyles.mainColumn}>
            <FacilityGallery
              facility={facility}
              mode='click-no-swipe'
              showArrows={true}
              onChangeIndex={this.facilityGalleryOnChangeIndex}
              onClickMiddle={goToDetail}
              noImageOnClick={goToDetail}
              noImagesClass={styles.noImages}
            />
          </div>
          <div className={styles.properties}>
            <Swipeout
              open={false}
              onChange={goToDetail}
              abortSwiping={() => this.swipeView && this.swipeView.abortSwiping()}
            >
              <SwipeResistibleLink to={`/now/${this.props.match.params.pos}/${api.idToStr(facility.features.id)}`}>
                <div className={styles.detail}>
                  <Typography className={styles.distance}>{facility.features.distance}m</Typography>
                  <div className={styles.arrowContainer}>
                    <ArrowUpIcon className={styles.arrowUp} />
                  </div>
                </div>
              </SwipeResistibleLink>
              <AttributeList attributes={facility.attributes} />
            </Swipeout>
          </div>
        </div>
      )
    };

    let Toggle = null;
    if (api.inExperimentalMode()) {
      Toggle = (
        <div>
          <Switch checked={this.props.includePlacesWithoutAccessibility} onChange={(event: object, checked: boolean) => {
            this.props.requestIncludePlacesWithoutAccessibility(checked);
          }} />
        </div>
      );
    } else {
      Toggle = <div style={{ height: 48 }}></div>;
    }

    if (this.props.facilities === null) {
      return <EmptyWaitingScreen />;
    } else if (this.props.facilities.length === 0) {
      return <Centered className={commonStyles.mainColumn}>No facility was found in a 1km radius.</Centered>;
    } else {
      return (
        <div className={commonStyles.mainColumn}>
          <div className={commonStyles.columnLayout}>
            <div className={styles.topRowOptions}>
              <div className={styles.centerVertically}>
                <SwipeResistibleLink to={'/'}>
                  <BackIcon />
                </SwipeResistibleLink>
              </div>
              {Toggle}
              <div className={styles.centerVertically}><MoreIcon /></div>
            </div>
            <SwipeViewReduxProvider
              swipeView={(ele) => this.swipeView = ele}
            >
              {this.props.facilities.map(createElement)}
            </SwipeViewReduxProvider>
          </div>
        </div>
      );
    }
  }
}

const mapStateToProps = (state: any) => ({
  facilities: state.apiBuffering.facilities,
  curFacility: state.apiBuffering.curFacility,
  includePlacesWithoutAccessibility: state.globalState.includePlacesWithoutAccessibility,
});

const mapDispatchToProps = {
  chooseFacility,
  radiusSearch,
  requestIncludePlacesWithoutAccessibility,
};

export default connect<{}, {}, Props>(
  mapStateToProps,
  mapDispatchToProps,
)(Now)
