import * as React from 'react';
import Paper from '@material-ui/core/Paper';

import styles from './Paper.module.css';

type Props = {
  children: React.ReactNode,
  className?: string,
}

// Like Paper but with more spacing
export default function (props: Props) {
  return <Paper className={`${styles.paper} ${props.className !== undefined ? props.className : ''}`}>{props.children}</Paper>;
}
