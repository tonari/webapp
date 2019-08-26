import * as React from 'react';
import { LinearProgress } from '@material-ui/core';

import commonStyles from '../containers/commonStyles.module.css';

export default function EmptyWaitingScreen() {
  // note: the empty div is for shifting the navigation to the bottom
  return (
    <React.Fragment>
      <LinearProgress />
      <div className={commonStyles.mainColumn} />
    </React.Fragment>
  );
}
