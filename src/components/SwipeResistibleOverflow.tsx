
import * as React from 'react';

import styles from './SwipeResistibleOverflow.module.css';
import SwipeView from './SwipeView';

type Props = {
  swipeView: SwipeView | null,
}

export default class SwipeResistibleOverflow extends React.Component<Props, {}> {
  onScroll = () => {
    if (this.props.swipeView !== null) {
      this.props.swipeView.abortSwiping();
    }
  }

  render() {
    return (
      <div className={styles.container} onScroll={this.onScroll}>
        {this.props.children}
      </div>
    );
  }
}
