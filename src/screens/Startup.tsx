import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { ReactComponent as NowIcon } from '../res/nav/now.svg';
import { ReactComponent as LaterIcon } from '../res/nav/later.svg';
import { ReactComponent as AddIcon } from '../res/nav/add.svg';

import styles from './Startup.module.css';
import * as api from '../api';

const icons: { [key: string]: any } = {
  'now': NowIcon,
  'later': LaterIcon,
  'add': AddIcon,
};

class Startup extends React.Component<RouteComponentProps<{}>, {}> {
  onMenuButton = (what: string) => {
    if (what === 'now' || api.inExperimentalMode() && what === 'add') {
      this.props.history.push('/' + what);
    }
  }

  MenuButton = (what: string) => {
    const Icon = icons[what];
    return (
      <div onClick={() => this.onMenuButton(what)}>
        <Icon className={styles.icon} />
        <Typography className={styles.name}>{what}</Typography>
      </div>
    );
  }

  render() {
    return (
      <div>
        <div className={styles.logo}><img src='https://tonari.app/logo-round-transparent.svg' /></div>
        <Typography className={styles.tonari}>TONARI</Typography>
        <div className={styles.menu}>
          {this.MenuButton('now')}
          <div className={styles.separator}></div>
          {this.MenuButton('later')}
          <div className={styles.separator}></div>
          {this.MenuButton('add')}
        </div>
      </div>
    );
  }
}

export default withRouter(Startup);
