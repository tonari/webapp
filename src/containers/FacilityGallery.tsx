import React from 'react';
import { connect } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import MobileStepper from '@material-ui/core/MobileStepper';
import PhotoIcon from '@material-ui/icons/Photo';
import classNames from 'classnames';

import SwipeView from '../components/SwipeView';
import styles from './FacilityGallery.module.css';
import { ApiBufferingState, setFullscreen } from '../redux';
import * as api from '../api';
import { ReactComponent as ArrowLeftIcon } from '../res/other/arrowLeft.svg';
import { ReactComponent as CloseIcon } from '../res/other/cancel.svg';
import { ReactComponent as ReportIcon } from '../res/other/report.svg';

type Props = {
  // The facility to display
  facility: api.Facility,
  fullscreen?: boolean,
  // Map of all images from all facilities
  images?: ApiBufferingState['images'],
  setFullscreen?: typeof setFullscreen,
  // Mode to be forwarded to the SwipeView
  mode: 'swipe' | 'click' | 'click-no-swipe',
  className?: string,
  onChangeIndex?: (arg: string) => void,
  showArrows?: boolean,
  onClickMiddle?: () => void,
  noImageOnClick?: () => void,
  noImagesClass?: string,
}

type State = {
  index: number,
}

function getImages(props: Props) {
  return props.images![api.idToStr(props.facility.features.id)] || null;
}

class FacilityGallery extends React.Component<Props, State> {
  state = {
    index: 0,
  }

  static defaultProps = {
    onChangeIndex: (arg: string) => { },
    showArrows: false,
  }

  onChangeIndex = (index: number) => {
    this.setState({ index });
  }

  onClickMiddle = () => {
    if (this.props.onClickMiddle === undefined) {
      this.props.setFullscreen!(true);
    } else {
      this.props.onClickMiddle();
    }
  }

  noImageOnClick = () => {
    if (this.props.noImageOnClick !== undefined) {
      this.props.noImageOnClick();
    }
  }

  render() {
    const className = this.props.className || '';

    const images = getImages(this.props);
    if (images === null) {
      return <div className={classNames(styles.loading, className, { [this.props.noImagesClass!]: this.props.noImagesClass !== undefined })}><CircularProgress /></div>;
    } else if (images.length === 0) {
      return <div className={classNames(styles.noImage, className, { [this.props.noImagesClass!]: this.props.noImagesClass !== undefined })}><PhotoIcon onClick={this.noImageOnClick} /></div>;
    } else {
      this.props.onChangeIndex!(images[this.state.index]);

      const arrows = (() => {
        const first = this.state.index === 0;
        const last = this.state.index === images.length - 1;

        if (this.props.showArrows || this.props.fullscreen) {
          return (
            <React.Fragment>
              {!first && <ArrowLeftIcon className={styles.arrowLeft} />}
              {!last && <ArrowLeftIcon className={styles.arrowRight} />}
            </React.Fragment>
          );
        } else {
          return null;
        }
      })();

      const otherIcons = (() => {
        if (this.props.fullscreen) {
          return (
            <React.Fragment>
              <ReportIcon className={styles.reportIcon} />
              <CloseIcon className={styles.closeIcon} onClick={() => this.props.setFullscreen!(false)} />
            </React.Fragment>
          )
        } else {
          return null;
        }
      })();

      return (
        <div className={`${styles.swipeContainer} ${className}`}>
          <SwipeView
            index={this.state.index}
            onChangeIndex={this.onChangeIndex}
            onClickMiddle={this.onClickMiddle}
            mode={this.props.fullscreen ? 'swipe' : this.props.mode}
            className={styles.swipeContainer}>
            {
              images.map((url) =>
                <div className={styles.imageContainer} key={url} >
                  <img className={styles.image + (this.props.fullscreen ? ' ' + styles.fullscreen : '')} src={url} />
                </div>
              )
            }
          </SwipeView>
          {arrows}
          {otherIcons}
          <MobileStepper
            steps={images.length}
            position='static'
            activeStep={this.state.index}
            backButton={<React.Fragment />}
            nextButton={<React.Fragment />}
            className={styles.stepper} />
        </div>
      )
    }
  }
}

const mapStateToProps = (state: any) => ({
  images: state.apiBuffering.images,
  fullscreen: state.globalState.fullscreen,
});

const mapDispatchToProps = {
  setFullscreen,
};

export default connect<{}, {}, Props>(
  mapStateToProps,
  mapDispatchToProps,
)(FacilityGallery);
