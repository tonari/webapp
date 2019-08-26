import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom'
import Typography from '@material-ui/core/Typography';
import SaveIcon from '@material-ui/icons/SaveOutlined';
import ButtonBase from '@material-ui/core/ButtonBase';
import BackIcon from '@material-ui/icons/ArrowBack';
import classNames from 'classnames';

import { updateFacilityData, ApiBufferingState, radiusSearch } from '../redux';
import AttributeSwitcher from '../components/AttributeSwitcher';
import Centered from '../components/Centered';
import commonStyles from '../containers/commonStyles.module.css';
import { facilityById } from '../common';
import EmptyWaitingScreen from '../components/EmptyWaitingScreen';
import * as api from '../api';
import detailStyles from './Detail.module.css';
import styles from './Edit.module.css';

type State = {
  changedSmth: boolean,
  attributes: api.Attributes,
}

type Match = {
  id: string,
  pos: string,
}

type Props = {
  facilities: ApiBufferingState['facilities'],
  radiusSearch: typeof radiusSearch,
  updateFacilityData?: typeof updateFacilityData,
}

class Edit extends React.PureComponent<RouteComponentProps<Match> & Props, State> {
  state = {
    changedSmth: false,
    attributes: {},
  }

  getId(): api.Id {
    return api.idFromStr(this.props.match.params.id);
  }

  // the facility that is currently displayed in this screen
  getFacility = (): api.Facility | null => {
    return facilityById(this.props.facilities, this.getId());
  }

  onClick = () => {
    if (this.state.changedSmth) {
      this.props.updateFacilityData!(this.getId(), this.state.attributes);
    }

    const path = this.props.history.location.pathname.split('/');
    if (4 >= path.length || path[4] === 'edit') {
      this.props.history.push(`/now/${this.props.match.params.pos}/${this.props.match.params.id}`);
    } else {
      this.props.history.push(`/now/${this.props.match.params.pos}/${this.props.match.params.id}/go`);
    }
  }

  render() {
    if (this.props.facilities === null) {
      // the page was refreshed and thus no facilities were loaded so far

      const pos = api.positionFromStr(this.props.match.params.pos);
      this.props.radiusSearch(pos, this.getId());

      return <EmptyWaitingScreen />;
    }

    const facility = this.getFacility();

    if (facility === null) {
      return <Centered className={commonStyles.mainColumn}>Internal error. This shouldn't have happened.</Centered>;
    }

    if (this.state.changedSmth) {
      var icon = <SaveIcon className={classNames(commonStyles.iconGoSave)} />;
      var text = 'SAVE';
    } else {
      var icon = <BackIcon className={classNames(commonStyles.iconGoSave)} />;
      var text = 'BACK';
    }

    return (
      <div className={commonStyles.mainColumn}>
        <div className={commonStyles.columnLayout}>
          <div className={commonStyles.mainColumn}>
            <div className={detailStyles.allAttributesScreenOutter}>
              <div className={classNames(detailStyles.allAttributesScreenInner, commonStyles.columnLayout)}>
                <div className={commonStyles.columnLayout}>
                  <div className={commonStyles.mainColumn}>
                    <div className={styles.overflow}>
                      <AttributeSwitcher
                        attributes={facility.attributes}
                        id={this.getId()}
                        onClick={() => { this.setState({ changedSmth: true }) }}
                        onChangeAttributes={(attr: api.Attributes) => {
                          this.setState({ attributes: attr });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ButtonBase className={commonStyles.buttonGoSave} onClick={this.onClick}>
            {icon}
            <Typography className={commonStyles.textGoSave}>{text}</Typography>
          </ButtonBase>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  facilities: state.apiBuffering.facilities,
});

const mapDispatchToProps = {
  radiusSearch,
  updateFacilityData,
};

export default withRouter(connect<{}, {}, Props>(
  mapStateToProps,
  mapDispatchToProps,
)(Edit));
