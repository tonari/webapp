import * as React from 'react';
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';
import { isMobile } from 'is-mobile';

import { swipeThreshold } from '../constants';

type InputEvent = MouseEvent | TouchEvent;

function unify(e: any) {
  return e.changedTouches ? e.changedTouches[0] : e;
}

type Props = {
  open: boolean,
  overflowHeight?: any,
  abortSwiping?(): any,
  onChange(isOpen: boolean): any,
};

type State = {
  swipeDisabled: boolean
};

export default class Swipeout extends React.Component<Props, State> {
  container: React.RefObject<HTMLDivElement>;
  moved: boolean = false;
  x0: number = 0;
  y0: number = 0;
  state = {
    swipeDisabled: false
  };

  constructor(props: Props) {
    super(props);

    this.container = React.createRef();
  }

  componentDidMount() {
    if (isMobile({ tablet: true })) {
      this.container.current!.addEventListener('touchstart', this.containerDown, false);
      this.container.current!.addEventListener('touchmove', this.containerMove, false);
    } else {
      this.container.current!.addEventListener('mousedown', this.containerDown, false);
      this.container.current!.addEventListener('mousemove', this.containerMove, false);
    }
  }

  componentWillUnmount() {
    if (this.container.current !== null) {
      if (isMobile({ tablet: true })) {
        this.container.current.removeEventListener('touchstart', this.containerDown, false);
        this.container.current.removeEventListener('touchmove', this.containerMove, false);
      } else {
        this.container.current.removeEventListener('mousedown', this.containerDown, false);
        this.container.current.removeEventListener('mousemove', this.containerMove, false);
      }

    }
  }

  containerDown = (e: InputEvent) => {
    this.moved = false;
    this.y0 = unify(e).clientY;
    this.x0 = unify(e).clientX;

    if (this.props.open && e.currentTarget) {
      const target: any = e.currentTarget;

      if (target.getBoundingClientRect && target.getBoundingClientRect().y) {
        // The click is within the area that can be swiped down.
        if (this.y0 - target.getBoundingClientRect().y < 40) {
          this.setState({ swipeDisabled: false });
        } else {
          this.setState({ swipeDisabled: true });
        }
      }
    }
  };

  containerMove = (e: InputEvent) => {
    if (Math.abs(unify(e).clientY - this.y0) >= swipeThreshold && !this.moved) {
      if (this.props.abortSwiping) {
        this.props.abortSwiping();
      }
    }
    if (Math.abs(unify(e).clientX - this.x0) >= swipeThreshold) {
      this.moved = true;
    }
  };

  render() {
    return (
      <div
        ref={this.container}
        style={{ flex: '2 1', display: 'flex' }}
      >
        <SwipeableBottomSheet
          open={this.props.open}
          overflowHeight={this.props.overflowHeight === undefined ? null : this.props.overflowHeight}
          overlay={false}
          shadowTip={false}
          topShadow={false}
          swipeableViewsProps={{
            disabled: this.state.swipeDisabled,
            style: {
              height: '100%'
            },
            containerStyle: {
              height: '100%'
            },
            slideStyle: {
              height: '100%'
            }
          }}
          onChange={this.props.onChange}
          style={{
            height: '100%',
            width: '100%',
            position: 'relative'
          }}
          bodyStyle={{
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexFlow: 'column',
            transform: this.props.open ? 'translateY(100%)' : undefined
          }}
        >
          {this.props.children}
        </SwipeableBottomSheet>
      </div>
    );
  }
}
