import * as React from 'react';
import Typography from '@material-ui/core/Typography';

import styles from './Centered.module.css';

type Props = {
  children: React.ReactNode,
  className?: string,
}

// a text that is vertically and horizontally centered
export default function Centered(props: Props) {
  return <Typography className={`${styles.centered} ${props.className || ''}`}>{props.children}</Typography>;
}
