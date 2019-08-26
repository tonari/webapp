import * as React from 'react';
import { connect } from 'react-redux';
import { Dialog, ButtonBase, DialogContent, DialogTitle, FormControlLabel, Radio, RadioGroup, Typography } from '@material-ui/core';
import CheckCircle from '@material-ui/icons/CheckCircle';
import RadioButtonUnchecked from '@material-ui/icons/RadioButtonUnchecked';

import * as api from '../api';
import Attribute from './Attribute';
import styles from './Attribute.module.css';

type State = {
  attributes: api.Attributes,
  openAttribute: string,
  open: boolean,
  openedAt: Date,
  picked: string | boolean | undefined
}

type DispatchProps = {
};

type RequiredProps = {
  attributes: api.Attributes,
  id: api.Id,
  onClick?: () => void,
  onChangeAttributes: (attr: api.Attributes) => void,
};

type Props = DispatchProps & RequiredProps;

class AttributeSwitcher_ extends React.PureComponent<Props, State> {
  list: React.RefObject<HTMLDivElement>;
  state = {
    attributes: {} as api.Attributes,
    openAttribute: 'grabRail',
    open: false,
    openedAt: new Date(),
    picked: ''
  };

  constructor(props: Props) {
    super(props);

    this.state.attributes = props.attributes;
    this.list = React.createRef();
  }

  enable(attr: string) {
    this.setState(state => {
      let attributes = { ...state.attributes };
      attributes[attr] = true;
      this.props.onChangeAttributes(attributes);
      return {
        ...state,
        attributes
      }
    });
  }

  disable(attr: string) {
    this.setState(state => {
      let attributes = { ...state.attributes };
      attributes[attr] = false;
      this.props.onChangeAttributes(attributes);
      return {
        ...state,
        attributes
      }
    });
  }

  openDialog = (attr: string) => {
    this.setState(state => {
      return {
        ...state,
        open: true,
        openedAt: new Date(),
        openAttribute: attr,
        picked: state.attributes[attr]
      }
    });
    this.list.current!.className = `${styles.attributeList} ${styles.blurred}`;
  }

  closeDialog = (save: boolean) => {
    this.setState(state => {
      let attributes = { ...state.attributes };
      if (state.picked !== '' && save) {
        attributes[state.openAttribute] = state.picked;
      }
      this.props.onChangeAttributes(attributes);

      return {
        ...state,
        open: false,
        attributes: attributes
      };
    });
    this.list.current!.className = styles.attributeList;
  }

  onPickOption = (e: any) => {
    this.setState({ picked: e.target.value })
  }

  render() {
    return (
      <div>
        <div ref={this.list} className={styles.attributeList}>
          {
            Object.keys(api.editableAttributeToText).map((attr: string) => {
              if (api.isAttributeBoolean(attr)) {
                if (this.state.attributes[attr]) {
                  var onClick = () => { this.props.onClick && this.props.onClick(); this.disable(attr); };
                } else {
                  var onClick = () => { this.props.onClick && this.props.onClick(); this.enable(attr); };
                }
              } else {
                var onClick = () => { this.props.onClick && this.props.onClick(); this.openDialog(attr); };
              }
              return (
                <Attribute
                  key={attr}
                  isChangable={true}
                  attribute={attr}
                  attributeValue={this.state.attributes[attr]}
                  onClick={onClick}
                />
              );
            })
          }
        </div>
        <Dialog
          open={this.state.open}
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
          <DialogTitle disableTypography><Typography className={styles.attributeDialogTitle}>{api.editableAttributeToText[this.state.openAttribute]}</Typography></DialogTitle>
          <div className={styles.dialogContentWrapper}>
            <DialogContent
              className={styles.dialogContent}
            >

              <RadioGroup onChange={this.onPickOption} value={this.state.picked}>
                {
                  api.validAttributeValues[this.state.openAttribute].map((val: string[], index: number) => {
                    const isLastAttribute = index === api.validAttributeValues[this.state.openAttribute].length - 1;
                    const labelStyle = isLastAttribute ? `${styles.attributeDialogOption} ${styles.attributeDialogOptionLast}` : styles.attributeDialogOption;
                    return (
                      <FormControlLabel
                        label={<Typography className={styles.attributeDialogOptionText}>{val[1]}</Typography>}
                        value={val[0]}
                        labelPlacement='start'
                        className={labelStyle}
                        control={<Radio icon={<RadioButtonUnchecked style={{ fontSize: '1.2em' }} />} checkedIcon={<CheckCircle style={{ fontSize: '1.2em' }} />} color='primary' />}
                        key={val[0]}
                      />
                    );
                  })
                }
              </RadioGroup>

            </DialogContent>
          </div>
          <ButtonBase onClick={() => this.closeDialog(true)} className={styles.okButton}>
            <Typography className={styles.okButtonText}>OK</Typography>
          </ButtonBase>
        </Dialog>
      </div>)
  }
}

const mapStateToProps = (state: any) => ({
});

const mapDispatchToProps = {
}

const AttributeSwitcher = connect<{}, {}, RequiredProps>(
  mapStateToProps,
  mapDispatchToProps
)(AttributeSwitcher_)
export default AttributeSwitcher;
