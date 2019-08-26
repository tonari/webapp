import * as React from 'react';

import styles from './SwipeView.module.css';
import { swipeThreshold } from '../constants';
import { isMobile } from 'is-mobile';

// based on https://css-tricks.com/simple-swipe-with-vanilla-javascript/
// license https://css-tricks.com/license/

type InputEvent = MouseEvent | TouchEvent;

function unify(e: any) {
  return e.changedTouches ? e.changedTouches[0] : e;
}

type Props = {
  index: number,
  onChangeIndex: (index: number) => any,
  className: string,
  // click-no-swipe: This is like 'click' but it doesn't stop the propagation of the click/ touch event if the "swipe" after the click exceeded the threshold. This enables us to have a click-swipeview in a swipe-swipeview.
  // I tested this on my mobile phone and the swipe() event is never called when I just click on the screen.
  mode: 'swipe' | 'click' | 'click-no-swipe' | 'disabled',
  // callback that is used when (mode=='click'||mode=='click-no-swipe') and the user clicks in the middle of the picture
  onClickMiddle: () => void,
};

export default class SwipeView extends React.Component<Props, {}> {
  i: number = 0;
  // x coordinate offset, when mouse down event happened
  x0: number = 0;
  container: React.RefObject<HTMLDivElement>;
  swiping: boolean = false;
  moved: boolean = false;
  clicked: boolean = false;

  static defaultProps = {
    className: '',
    mode: 'swipe',
    onClickMiddle: () => { },
  }

  constructor(props: Props) {
    super(props);

    this.container = React.createRef();
  }

  shouldComponentUpdate(nextProps: any) {
    if (this.props.index! !== nextProps.index) {
      this.updateCssVars(nextProps);
    }

    return this.props.onChangeIndex !== nextProps.onChangeIndex
      || this.props.className !== nextProps.className
      || this.props.mode !== nextProps.mode
      || this.props.onClickMiddle !== nextProps.onClickMiddle
      || this.props.children !== nextProps.children;
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.mode !== prevProps.mode) {
      // reset some of the state to get expected behavior
      // e.g. when the mode is changed in a onMouseDown event of another element, then we want to avoid
      // that the onMouseUp event of this component does anything. to fully archive this behavior, we
      // need the state `clicked`
      this.swiping = false;
      this.moved = false;
      this.clicked = false;
    }
  }

  updateCssVars = (props = this.props) => {
    if (this.container.current === null) return;

    this.i = props.index;
    this.container.current.style.setProperty('--index', props.index.toString());

    const children = (props.children as React.ReactNodeArray).length;
    this.container.current.style.setProperty('--children', children.toString());
  }

  componentDidMount() {
    // componentDidMount is called after the first render() and therefore
    // 1. the CSS vars have to be set here, and
    // 2. the container is set and unequal to null
    this.updateCssVars();

    // use {passive: true} to potentially improve performance, see
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Improving_scrolling_performance_with_passive_listeners
    if (isMobile({ tablet: true })) {
      this.container.current!.addEventListener('touchstart', this.containerDown);
      this.container.current!.addEventListener('touchmove', this.containerMove, { passive: true });
      this.container.current!.addEventListener('touchend', this.containerUp);
      window.addEventListener('touchend', this.windowUp, { passive: true });
    } else {
      this.container.current!.addEventListener('mousedown', this.containerDown);
      this.container.current!.addEventListener('mousemove', this.containerMove, { passive: true });
      this.container.current!.addEventListener('mouseup', this.containerUp);
      window.addEventListener('mouseup', this.windowUp, { passive: true });
    }
  }

  componentWillUnmount() {
    if (this.container.current !== null) {
      if (isMobile({ tablet: true })) {
        this.container.current.removeEventListener('touchstart', this.containerDown);
        this.container.current.removeEventListener('touchmove', this.containerMove);
        this.container.current.removeEventListener('touchend', this.containerUp);
      } else {
        this.container.current.removeEventListener('mousedown', this.containerDown);
        this.container.current.removeEventListener('mousemove', this.containerMove);
        this.container.current.removeEventListener('mouseup', this.containerUp);
      }
    }

    if (isMobile({ tablet: true })) {
      window.removeEventListener('touchend', this.windowUp);
    } else {
      window.removeEventListener('mouseup', this.windowUp);
    }
  }

  // the displayed width of the SwipeView
  width = (): null | number => {
    const child = this.container.current!.firstElementChild;

    // a SwipeView with no children makes no sense
    if (child === null) return null;

    // don't use this.container.clientWidth since the overflow might not be hidden
    return child.clientWidth;
  };

  abortSwiping = () => {
    this.swiping = false;
    this.x0 = 0;
    this.container.current!.style.setProperty('--translate_x', '0px');
  }

  containerDown = (e: InputEvent) => {
    if (this.props.mode === 'disabled') {
      this.clicked = false;
      return;
    }

    this.clicked = true;

    this.moved = false;
    this.x0 = unify(e).clientX;

    if (this.props.mode === 'swipe') {
      this.swiping = true;
      this.container.current!.classList.remove(styles.release);
    }

    if (this.props.mode !== 'click' && this.props.mode !== 'click-no-swipe') {
      // maybe this class was left from the 'click' or 'click-no-swipe' mode. therefore remove it
      this.container.current!.classList.remove(styles.click);
    }
  };

  containerMove = (e: InputEvent) => {
    if (this.props.mode === 'disabled') return;

    // prevent the image to be "clickable" in "click-no-swipe" mode, if the movement exceeded the threshold
    const signedDistance = unify(e).clientX - this.x0;
    const distance = Math.abs(signedDistance);
    const distanceSign = Math.sign(signedDistance);
    if (this.props.mode === 'swipe' || this.props.mode === 'click-no-swipe') {
      if (distance < swipeThreshold) return;
    }

    this.moved = true;

    if (!this.swiping) return;

    // limit moving of the first and last element
    const w = this.width();
    if (w === null) return;
    if (distance >= w / 5 && (this.i === 0 && distanceSign === 1 || this.i === this.container.current!.childElementCount - 1 && distanceSign === -1)) return;

    this.container.current!.style.setProperty('--translate_x', `${Math.round(unify(e).clientX - this.x0)}px`);
  };

  containerUp = (e: InputEvent) => {
    if (!this.clicked || this.container.current === null) return;

    if (this.props.mode === 'click' || this.props.mode === 'click-no-swipe') {
      if (this.moved && this.props.mode === 'click-no-swipe') return;

      // without this, a SwipeView might skip some children. then it seems like you had clicked twice
      e.preventDefault();

      const w = this.width();
      if (w === null) return;
      const x = unify(e).clientX / w;

      const relativeSpace = 0.25;
      if (x < relativeSpace) {
        if (this.i === 0) return;
        this.i--;
      } else if (x > 1 - relativeSpace) {
        if (this.i >= this.container.current!.childElementCount - 1) return;
        this.i++;
      } else {
        this.props.onClickMiddle();
      }

      // in onClickMiddle things can potentially happen that lead to this.conatiner.current === null
      if (this.container.current !== null) {
        this.container.current.classList.add(styles.click);
      }
      this.props.onChangeIndex(this.i);
    }
  }

  windowUp = (e: InputEvent) => {
    if (!this.swiping || !this.clicked) return;

    const child = this.container.current!.firstElementChild;

    const w = this.width();
    if (w === null) return;

    const dx = unify(e).clientX - this.x0;
    const s = Math.sign(dx);
    let f = s * dx / w;

    const threshold = .1;
    let changed = false;
    if ((this.i > 0 || s < 0) && (this.i < this.container.current!.childElementCount - 1 || s > 0) && f > threshold) {
      this.i -= s;
      changed = true;
      f = 1 - f;
    }

    this.container.current!.style.setProperty('--translate_x', '0px');
    this.container.current!.style.setProperty('--f', f.toString());
    this.swiping = false;
    this.container.current!.classList.add(styles.release);
    this.x0 = 0;

    // we shouldn't call it directly in the above if, sine then the release class is not set!
    if (changed) {
      this.props.onChangeIndex(this.i);
    }
  }

  render() {
    this.updateCssVars();

    const classNames = styles.container + ' ' + this.props.className;

    return (
      <div className={classNames} ref={this.container}>
        {this.props.children}
      </div>
    );
  }
};
