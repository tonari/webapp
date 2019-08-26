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

type State = {
  notificationDialogOpen: boolean,
  registration: ServiceWorkerRegistration | null
};

class App extends React.PureComponent<{}, State> {

  constructor(props: {}) {
    super(props);

    this.state = {
      notificationDialogOpen: false,
      registration: null
    };
    this.registerNotifications();
  }

  registerNotifications() {
    serviceWorker.register({
      onSuccess: (registration) => {

        const subscribe = () => {
          this.openDialog(registration);
        }

        let serviceWorker;
        if (registration.installing) {
          serviceWorker = registration.installing;
        } else if (registration.waiting) {
          serviceWorker = registration.waiting;
        } else if (registration.active) {
          serviceWorker = registration.active;
        }

        if (serviceWorker) {
          if (serviceWorker.state === 'activated') {
            subscribe();
          } else {
            serviceWorker.addEventListener('statechange', (e) => {
              if (e && e.target && (e.target as any).state === 'activated') {
                subscribe();
              }
            })
          }
        }
      }
    });
  }

  closeDialog = (result: boolean) => {
    const applicationServerKey = new Uint8Array(process.env.REACT_APP_BACKEND_NOTIFICATION_KEY!.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));

    if (result && this.state.registration && this.state.registration.pushManager) {
      this.state.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
    }

    this.setState({ notificationDialogOpen: false })
  }

  openDialog = (registration: ServiceWorkerRegistration) => {
    this.setState({ notificationDialogOpen: true, registration })
  }

  render = () => {
    return (
      <React.Fragment>
        <Router>
          <div className={classNames(styles.main, { [styles.presenting]: api.inPresentingMode() }, { [styles.blurred]: this.state.notificationDialogOpen })}>
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
        <Dialog
          open={this.state.notificationDialogOpen}
          className={styles.attributeDialog}
          fullWidth
          maxWidth='xl'
          onBackdropClick={() => {
            this.closeDialog(false);
          }}
          BackdropProps={{
            style: {
              opacity: 0,
            }
          }}
        >
          <DialogTitle disableTypography><Typography className={styles.attributeDialogTitle}>Enable Notifications?</Typography></DialogTitle>
          <div className={styles.dialogContentWrapper}>
            <DialogContent
              className={styles.dialogContent}
            >
              <Typography>
                Tonari works best when everybody shares what they've found – can the app ask you about your observations?
            </Typography>
            </DialogContent>
          </div>
          <ButtonBase onClick={() => this.closeDialog(true)}>
            <Typography>Yes</Typography>
          </ButtonBase>
          <ButtonBase onClick={() => this.closeDialog(false)}>
            <Typography>No</Typography>
          </ButtonBase>
        </Dialog>
      </React.Fragment >
    );
  }
}

export default withRoot(App);
