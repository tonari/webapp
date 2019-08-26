import * as React from 'react';
import CameraIcon from '@material-ui/icons/PhotoCameraOutlined';
import classNames from 'classnames';

import commonStyles from '../containers/commonStyles.module.css';
import styles from './ImageUpload.module.css';
import * as api from '../api';

type Props = {
  facility: api.Facility | null
}

class ImageUpload extends React.PureComponent<Props, {}> {
  onChange = async (e: any) => {
    if (e.target.files === null || e.target.files.length === 0) return;

    const facility = this.props.facility;
    if (facility === null) return;

    const url = URL.createObjectURL(e.target.files[0]);
    await api.uploadImage(facility, url);
    URL.revokeObjectURL(url);
  }

  render() {
    return (
      <React.Fragment>
        <label htmlFor='image-upload'><CameraIcon className={classNames(commonStyles.icon)} /></label>
        <input id='image-upload' className={styles.imageUpload} type='file' accept='image/*' onChange={this.onChange} />
      </React.Fragment>
    );
  }
}

export default ImageUpload;
