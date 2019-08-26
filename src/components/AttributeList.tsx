import * as React from 'react';

import * as api from '../api';
import Attribute from './Attribute';
import styles from './Attribute.module.css';

type Props = {
  attributes: { [key: string]: string | boolean | undefined },
  detailScreen?: boolean
}

export default function AttributeList(props: Props) {
  const sliceLen = props.detailScreen ? undefined : 3;
  return <div className={styles.attributeList}>
    {
      // We first loop through all attributes and filter the existing ones to obtain the existing attributes in the correct order
      Object.keys(api.attributeValueToText)
        .filter((atr: string) => Object.keys(props.attributes).includes(atr))
        .filter((atr: string) => props.attributes[atr] !== false)
        .map((atr: string) =>
          <Attribute isChangable={false} key={atr} attribute={atr} attributeValue={props.attributes[atr]} onClick={() => { }} />
        )
        // Limit the number of attributes if necessary
        .slice(0, sliceLen)
    }
  </div>;
}
