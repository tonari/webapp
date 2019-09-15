import * as React from 'react';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom'
import classNames from 'classnames';
import { Dialog, ButtonBase, DialogContent, DialogTitle, Typography } from '@material-ui/core';

import withRoot from '../withRoot';
import Now from '../screens/Now';
import Detail from '../screens/Detail';
import Centered from '../components/Centered';
import styles from './App.module.css';
import commonStyles from './commonStyles.module.css';
import RedirectNowGPS from './RedirectNowGPS';
import * as api from '../api';
import Add from '../screens/Add';
import Startup from '../screens/Startup';
import Edit from '../screens/Edit';
import Go from '../screens/Go';
import * as serviceWorker from '../serviceWorker';

function UnimplementedPlaceholder() {
  return <Centered className={commonStyles.mainColumn}>This screen is not yet implemented.</Centered>;
}

function AddScreen() {
  if (api.inExperimentalMode()) {
    return <Add />;
  } else {
    return <UnimplementedPlaceholder />
  }
}

function NowScreen() {
  if (api.inDebuggingMode()) {
    // This is the cluster
    return <Redirect to='now/52.5262074_13.4005893' />;
  } else {
    return <RedirectNowGPS />;
  }
}

class App extends React.PureComponent<{}, {}> {
  render = () => {
    return (
      <React.Fragment>
        <Router>
          <div className={classNames(styles.main, { [styles.presenting]: api.inPresentingMode() })}>
            <Route path='/' exact component={() => <Startup />} />
            <Route path='/now' exact component={NowScreen} />
            <Route path='/now/:pos' exact render={(props: any) => <Now {...props} />} />
            <Route path='/later' exact component={UnimplementedPlaceholder} />
            <Route path='/add' exact component={AddScreen} />
            <Route path='/now/:pos/:id' exact component={Detail} />
            <Route path='/now/:pos/:id/edit' exact component={Edit} />
            <Route path='/now/:pos/:id/go' exact component={Go} />
            <Route path='/now/:pos/:id/go/edit' exact component={Edit} />

            {api.inPresentingMode() && <style>{'body { background-color: #666; }'}</style>}

            {api.inStagingMode() && <span className={styles.stagingMode}>Staging mode active</span>}
          </div>
        </Router>
      </React.Fragment >
    );
  }
}

export default withRoot(App);
