import * as React from 'react';

import styles from './Attribute.module.css';

import { ReactComponent as BottomClearanceIcon } from '../res/attribute-icons/bottomClearance.svg';
import { ReactComponent as EmergencyCallIcon } from '../res/attribute-icons/emergencyCall.svg';
import { ReactComponent as FacilityTypePrivateIcon } from '../res/attribute-icons/facilityType-private.svg';
import { ReactComponent as FacilityTypePublicIcon } from '../res/attribute-icons/facilityType-public.svg';
import { ReactComponent as FeeIcon } from '../res/attribute-icons/fee.svg';
import { ReactComponent as GenderMaleIcon } from '../res/attribute-icons/gender-male.svg';
import { ReactComponent as GenderFemaleIcon } from '../res/attribute-icons/gender-female.svg';
import { ReactComponent as GenderUnisexIcon } from '../res/attribute-icons/gender-unisex.svg';
import { ReactComponent as GrabRailBothIcon } from '../res/attribute-icons/grabRail-both.svg';
import { ReactComponent as GrabRailLeftIcon } from '../res/attribute-icons/grabRail-left.svg';
import { ReactComponent as GrabRailRightIcon } from '../res/attribute-icons/grabRail-right.svg';
import { ReactComponent as GrabRailNoneIcon } from '../res/attribute-icons/grabRail-none.svg';
import { ReactComponent as KeyAnyIcon } from '../res/attribute-icons/key-any.svg';
import { ReactComponent as KeyNoneIcon } from '../res/attribute-icons/key-none.svg';
import { ReactComponent as LateralAccessIcon } from '../res/attribute-icons/lateralAccess.svg';
import { ReactComponent as OpeningHoursOpenIcon } from '../res/attribute-icons/openingHours-open.svg';
import { ReactComponent as OpeningHoursClosedIcon } from '../res/attribute-icons/openingHours-closed.svg';
import { ReactComponent as ReachableControlsIcon } from '../res/attribute-icons/reachableControls.svg';
import { ReactComponent as ShowerIcon } from '../res/attribute-icons/shower.svg';
import { ReactComponent as SinkInsideCabinIcon } from '../res/attribute-icons/sinkInsideCabin.svg';
import { ReactComponent as SpaciousIcon } from '../res/attribute-icons/spacious.svg';
import { ReactComponent as WheelchairAccessNoStepsIcon } from '../res/attribute-icons/wheelchairAccess-noSteps.svg';
import { ReactComponent as WheelchairAccessOneStepIcon } from '../res/attribute-icons/wheelchairAccess-oneStep.svg';

export function AttributeIcon(props: { attribute: string, attributeValue: any }) {
  const attribute = props.attribute;

  switch (attribute) {
    case 'wheelchairAccess':
      if (props.attributeValue === 'noSteps') {
        return <WheelchairAccessNoStepsIcon className={styles.attributeIcon} />;
      } else if (props.attributeValue === 'oneStep') {
        return <WheelchairAccessOneStepIcon className={styles.attributeIcon} />;
      } else if (props.attributeValue === 'multipleSteps') {
        return <WheelchairAccessOneStepIcon className={styles.attributeIcon} />;
      }

      return <WheelchairAccessNoStepsIcon className={styles.attributeIcon} />;
    case 'facilityType':
      if (props.attributeValue === 'public') {
        return <FacilityTypePublicIcon className={styles.attributeIcon} />;
      } else if (props.attributeValue === 'private') {
        return <FacilityTypePrivateIcon className={styles.attributeIcon} />;
      }

      return <FacilityTypePublicIcon className={styles.attributeIcon} />;
    case 'isOpen':
      if (props.attributeValue === true) {
        return <OpeningHoursOpenIcon className={styles.attributeIcon} />;
      } else if (props.attributeValue === false) {
        return <OpeningHoursClosedIcon className={styles.attributeIcon} />;
      }

      return <OpeningHoursOpenIcon className={styles.attributeIcon} />;
    case 'fee':
      return <FeeIcon className={styles.attributeIcon} />;
    case 'gender':
      if (props.attributeValue === 'female') {
        return <GenderFemaleIcon className={styles.attributeIcon} />;
      } else if (props.attributeValue === 'male') {
        return <GenderMaleIcon className={styles.attributeIcon} />;
      } else if (props.attributeValue === 'unisex') {
        return <GenderUnisexIcon className={styles.attributeIcon} />;
      }

      return <GenderUnisexIcon className={styles.attributeIcon} />;
    case 'key':
      if (props.attributeValue === 'none') {
        return <KeyNoneIcon className={styles.attributeIcon} />;
      }

      // Any value for a key should show the key icon.
      return <KeyAnyIcon className={styles.attributeIcon} />;
    case 'spacious':
      return <SpaciousIcon className={styles.attributeIcon} />;
    case 'grabRail':
      if (props.attributeValue === 'both') {
        return <GrabRailBothIcon className={styles.attributeIcon} />;
      } else if (props.attributeValue === 'left') {
        return <GrabRailLeftIcon className={styles.attributeIcon} />;
      } else if (props.attributeValue === 'right') {
        return <GrabRailRightIcon className={styles.attributeIcon} />;
      } else if (props.attributeValue === 'none') {
        return <GrabRailNoneIcon className={styles.attributeIcon} />;
      }

      return <GrabRailBothIcon className={styles.attributeIcon} />;
    case 'lateralAccess':
      return <LateralAccessIcon className={styles.attributeIcon} />;
    case 'bottomClearance':
      return <BottomClearanceIcon className={styles.attributeIcon} />;
    case 'sinkInsideCabin':
      return <SinkInsideCabinIcon className={styles.attributeIcon} />;
    case 'reachableControls':
      return <ReachableControlsIcon className={styles.attributeIcon} />;
    case 'emergencyCall':
      return <EmergencyCallIcon className={styles.attributeIcon} />;
    case 'shower':
      return <ShowerIcon className={styles.attributeIcon} />;
  }

  return <p>No icon here</p>;
}
