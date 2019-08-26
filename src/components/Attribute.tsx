import * as React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { isMobile } from 'is-mobile';

import { swipeThreshold } from '../constants';
import styles from './Attribute.module.css';
import { attributeValueToText, isAttributeBoolean } from '../api';
import { AttributeIcon } from './AttributeIcon';

type Props = {
  attribute: string,
  attributeValue: string | boolean | undefined,
  isChangable: boolean,
  onClick: () => void,
}

type InputEvent = MouseEvent | TouchEvent;

function unify(e: any) {
  return e.changedTouches ? e.changedTouches[0] : e;
}

export default class Attribute extends React.Component<Props, {}> {
  container: React.RefObject<HTMLDivElement>;
  moved: boolean = false;
  x0: number = 0;
  y0: number = 0;

  constructor(props: Props) {
    super(props);

    this.container = React.createRef();
  }

  componentDidMount() {
    if (!this.props.isChangable) return;

    if (isMobile({ tablet: true })) {
      this.container.current!.addEventListener('touchstart', this.containerDown, false);
      this.container.current!.addEventListener('touchmove', this.containerMove, false);
      this.container.current!.addEventListener('touchend', this.containerUp, true);
    } else {
      this.container.current!.addEventListener('mousedown', this.containerDown, false);
      this.container.current!.addEventListener('mousemove', this.containerMove, false);
      this.container.current!.addEventListener('mouseup', this.containerUp, true);
    }
  }

  componentWillUnmount() {
    if (!this.props.isChangable) return;

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
    this.y0 = unify(e).clientY;
  };

  containerMove = (e: InputEvent) => {
    if (Math.abs(unify(e).clientX - this.x0) < swipeThreshold && Math.abs(unify(e).clientY - this.y0) < swipeThreshold) return;

    this.moved = true;
  };

  containerUp = (e: InputEvent) => {
    if (!this.moved) {
      this.props.onClick();
    }
    if (!isAttributeBoolean(this.props.attribute)) {
      e.preventDefault();
    }
  }

  isActive = () => {
    if (this.props.attributeValue === undefined || this.props.attributeValue === null) {
      return false;
    }

    // If there is a value for isOpen, it's always shown.
    if (isAttributeBoolean(this.props.attribute)) {
      return this.props.attributeValue;
    }

    return true;
  }

  render() {
    let value = 'undefined';
    if (this.props.attributeValue !== undefined) {
      value = this.props.attributeValue.toString();
    }
    const active = this.isActive();

    let icon = <AttributeIcon attribute={this.props.attribute} attributeValue={this.props.attributeValue} />;

    if (this.props.isChangable) {
      icon = (
        <IconButton disableRipple={!isAttributeBoolean(this.props.attribute)}>
          <AttributeIcon attribute={this.props.attribute} attributeValue={this.props.attributeValue} />
        </IconButton>
      );
    }

    return (
      <div ref={this.container} className={active ? styles.attribute : `${styles.attribute} ${styles.inactive}`}>
        {icon}
        <Typography className={styles.attributeText}>{attributeValueToText[this.props.attribute][value]}</Typography>
      </div>
    );
  }
};
