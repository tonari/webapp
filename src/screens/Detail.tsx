import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom'
import Typography from '@material-ui/core/Typography';
import MobileStepper from '@material-ui/core/MobileStepper';
import ArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import GoIcon from '@material-ui/icons/NavigationOutlined';
import EditIcon from '@material-ui/icons/Edit';
import ButtonBase from '@material-ui/core/ButtonBase';
import classNames from 'classnames';

import { ApiBufferingState, radiusSearch, addComment } from '../redux';
import AttributeList from '../components/AttributeList';
import Centered from '../components/Centered';
import FacilityGallery from '../containers/FacilityGallery';
import commonStyles from '../containers/commonStyles.module.css';
import { facilityById } from '../common';
import EmptyWaitingScreen from '../components/EmptyWaitingScreen';
import * as api from '../api';
import styles from './Detail.module.css';
import Swipeout from '../components/Swipeout';
import SwipeView from '../components/SwipeView';
import SwipeResistibleOverflow from '../components/SwipeResistibleOverflow';
import SwipeResistibleLink from '../components/SwipeResistibleLink';
import Comments from '../containers/Comments';

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
  fullscreen: boolean,
  comments: ApiBufferingState['comments'],
}

class Detail extends React.PureComponent<RouteComponentProps<Match> & Props, State> {
  swipeView: SwipeView | null = null;

  state = {
    index: 0,
    commentContent: '',
  }

  async componentDidMount() {
    if (this.props.facilities === null) return;

    const cur = facilityById(this.props.facilities, this.getId());
    if (cur == null) return;
  }

  getId(): api.Id {
    return api.idFromStr(this.props.match.params.id);
  }

  getPos(): api.Position {
    return api.positionFromStr(this.props.match.params.pos);
  }

  // the facility that is currently displayed in this screen
  getFacility = (): api.Facility | null => {
    return facilityById(this.props.facilities, this.getId());
  }

  clickGoButton = () => {
    api.willVisit(this.getId(), this.getPos());
    this.props.history.push(`/now/${this.props.match.params.pos}/${this.props.match.params.id}/go`);
  }

  render() {
    if (this.props.facilities === null) {
      // the page was refreshed and thus no facilities were loaded so far

      this.props.radiusSearch(this.getPos(), this.getId());

      return <EmptyWaitingScreen />;
    }

    const facility = this.getFacility();

    if (facility === null) {
      return <Centered className={commonStyles.mainColumn}>Internal error. This shouldn't have happened.</Centered>;
    }

    return (
      <div className={commonStyles.mainColumn}>
        <div className={commonStyles.columnLayout}>
          <div className={commonStyles.mainColumn}>
            <div className={styles.allAttributesScreenOutter}>
              <div className={classNames({ [styles.allAttributesScreenInner]: !this.props.fullscreen }, commonStyles.columnLayout)}>
                <div className={commonStyles.columnLayout}>
                  <FacilityGallery facility={facility} mode='click-no-swipe' className={classNames(styles.gallery, { [styles.galleryNotFullscreen]: !this.props.fullscreen })} />
                  {!this.props.fullscreen &&
                    <React.Fragment>
                      <Swipeout
                        open
                        onChange={() => this.props.history.push(`/now/${this.props.match.params.pos}`)}
                      >
                        {!this.props.fullscreen &&
                          <div className={styles.detail}>
                            <Typography className={styles.distance}>{facility.features.distance}m</Typography>
                            <div className={styles.arrowContainer}>
                              <SwipeResistibleLink to={`/now/${this.props.match.params.pos}`}>
                                <ArrowDownIcon className={classNames(styles.arrowDown, commonStyles.icon)} />
                              </SwipeResistibleLink>
                            </div>
                          </div>
                        }

                        <SwipeView
                          index={this.state.index}
                          onChangeIndex={(index: number) => this.setState({ index })}
                          className={commonStyles.mainColumn}
                          mode={this.props.fullscreen ? 'disabled' : 'swipe'}
                          ref={(ele) => this.swipeView = ele}
                        >
                          <div className={commonStyles.columnLayout}>
                            {!this.props.fullscreen &&
                              <div className={commonStyles.mainColumn}>
                                <SwipeResistibleOverflow swipeView={this.swipeView}>
                                  <AttributeList detailScreen attributes={facility.attributes} />
                                </SwipeResistibleOverflow>
                              </div>
                            }
                          </div>
                          <div className={`${commonStyles.columnLayout} ${styles.commentScreen}`}>
                            <Comments swipeView={this.swipeView} id={facility.features.id} />
                          </div>
                        </SwipeView>
                      </Swipeout>
                      <MobileStepper
                        steps={2}
                        position='static'
                        style={{ zIndex: 1 }}
                        activeStep={this.state.index}
                        backButton={<React.Fragment />}
                        nextButton={<React.Fragment />}
                        className={styles.stepper} />
                    </React.Fragment>
                  }
                </div>
              </div>
            </div>
          </div>
          {!this.props.fullscreen &&
            <ButtonBase className={classNames(commonStyles.buttonGoSave, commonStyles.goButton)} onClick={this.clickGoButton}>
              <GoIcon className={classNames(commonStyles.iconGoSave, styles.goIcon)} />
              <Typography className={commonStyles.textGoSave}>GO</Typography>
            </ButtonBase>
          }
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  facilities: state.apiBuffering.facilities,
  fullscreen: state.globalState.fullscreen,
  comments: state.apiBuffering.comments,
});

const mapDispatchToProps = {
  radiusSearch,
  addComment,
};

export default connect<{}, {}, Props>(
  mapStateToProps,
  mapDispatchToProps,
)(Detail);
