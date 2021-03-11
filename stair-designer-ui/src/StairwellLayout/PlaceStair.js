import React from 'react';
import { Button, } from 'antd';
import SelectBox from '../components/SelectBox';

const PlaceStair = (props) => {
    const { activeStair, handleWindowClose, handleStairValueUpdate } = props;
    return (
        //Might need to add:  These floor levels do not have corresponding levels and plan view on the model.  Do you wish to create them?
        <div>
            {!activeStair.isEditing &&
                <SelectBox
                    value={activeStair.planLevel}
                    options={activeStair.planLevels.map(level => ({ key: level, label: level }))}
                    label="Select a plan level to place stair"
                    stateKey="planLevel"
                    callBack={handleStairValueUpdate}
                />
            }
            <Button onClick={handleWindowClose} type="primary" block>{activeStair.isEditing ? "Update " : "Place "}Stair</Button>
        </div>
    )
}
export default PlaceStair;
