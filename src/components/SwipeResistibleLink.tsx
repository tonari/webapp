import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { swipeThreshold } from '../constants';
import { isMobile } from 'is-mobile';

type InputEvent = MouseEvent | TouchEvent;

function unify(e: any) {
  return e.changedTouches ? e.changedTouches[0] : e;
}

type Props = {
  to: string,
  external?: boolean,
  onClick?(e: InputEvent): any
};

type WholeProps = RouteComponentProps<{}> & Props;

// A link that doesn't fire after a swipe gesture.
// Drop-in replacement for <Link>
class SwipeResistibleLink extends React.Component<WholeProps, {}> {
  container: React.RefObject<HTMLDivElement>;
  moved: boolean = false;
  x0: number = 0;

  shouldComponentUpdate(nextProps: WholeProps) {
    return this.props.to !== nextProps.to;
  }

  constructor(props: WholeProps) {
    super(props);

    this.container = React.createRef();
  }

  componentDidMount() {
    if (isMobile({ tablet: true })) {
      this.container.current!.addEventListener('touchstart', this.containerDown, false);
      this.container.current!.addEventListener('touchmove', this.containerMove, false);
      this.container.current!.addEventListener('touchend', this.containerUp, false);
    } else {
      this.container.current!.addEventListener('mousedown', this.containerDown, false);
      this.container.current!.addEventListener('mousemove', this.containerMove, false);
      this.container.current!.addEventListener('mouseup', this.containerUp, false);
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
    this.x0 = unify(e).clientX;
  };

  containerMove = (e: InputEvent) => {
    if (Math.abs(unify(e).clientX - this.x0) < swipeThreshold) return;

    this.moved = true;
  };

  containerUp = (e: InputEvent) => {
    if (!this.moved) {
      if (this.props.onClick) {
        this.props.onClick(e);
      }
      if (this.props.external) {
        window.open(this.props.to, '_blank');
      } else {
        this.props.history.push(this.props.to);
      }
    }
  }

  render() {
    return (
      <span ref={this.container}>
        {this.props.children}
      </span>
    );
  }
};

export default withRouter(SwipeResistibleLink);
