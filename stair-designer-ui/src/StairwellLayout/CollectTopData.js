import React from 'react';
import { InputNumber, Input, Button, Form, Checkbox, Collapse, Select, Radio, Switch, Popover } from 'antd';
import { isInFeetOrInches } from '../Util/validators';
import * as constants from '../Util/constants';
import { formItemLayout, radioStyle } from '../Util/styles';
import SelectBox from '../components/SelectBox';

const CollectTopData = (props) => {



    const { handleStairInputChange, activeStair, handleStairValueUpdate, handleStairDirectionCheck, handleStoryEnter, handleLevelSelectionUpdate } = props;
    const Panel = Collapse.Panel;
    const renderSelect = (options, label, key, callBack, disabledItems = []) => {
        const items = options.map(option => <Select.Option value={option.key} key={option.key} disabled={disabledItems.includes(option.key)}>{option.label}</Select.Option>);
        return (
            <Form.Item label={label}  {...formItemLayout} >
                <Select
                    value={activeStair[key]}
                    style={{ width: 200 }}
                    onChange={(value) => callBack(key, value)}
                    key={key}>
                    {items}
                </Select>
            </Form.Item >
        )
    };

//This doesn't work because ids are not sequential with elevations
    const floorLevelSelections = activeStair.floorLevels
        // .slice(
        //     activeStair.floorLevels.findIndex(x => x.id === activeStair.bottomLevelId) + 1,
        //     activeStair.floorLevels.findIndex(x => x.id === activeStair.topLevelId)
        // )
        .map(level => ({ value: level.id, label: level.levelName }));

        //TODO:  This is a placeholder defintion.  Make dynamic
        const itemDefintion = (
            <div >
                <p>Stair width is the distance from inside of stringer to inside of stringer.  Typically, 3/8 plater stringers are used, making the overall stair width 3/4" wider.</p>
            </div>
        )
        const customLabel = (<Popover placement="top" title="Stair Width" content={itemDefintion} trigger="click" arrowPointAtCenter ><span style={{textDecoration: "underline dashed #1890ff"}}>Stair Width</span></Popover>)


    return (
        <Form layout="horizontal">
            <Form.Item label="StairName:"  {...formItemLayout}>
                {/* TODO: get list of names from app and ensure this is unique */}
                <Input onChange={handleStairInputChange} name="stairName" value={activeStair.stairName} style={{ width: 200 }} />
            </Form.Item>
            {/* TODO:  Make sure width will work with stair to edge distance and alert user if it doesn't */}
           
            <Form.Item
                label={customLabel}
                {...formItemLayout}
                
                help={constants.feetOrInches} >
                <Input onChange={handleStairInputChange} name="stairWidth" value={activeStair.stairWidth} style={{ width: 200 }} />
            </Form.Item>
            
            <SelectBox
                value={activeStair.bottomLevelId}
                options={activeStair.floorLevels.map(level => ({ key: level.id, label: level.levelName }))}
                label="Select Bottom Level"
                stateKey="bottomLevelId"
                callBack={handleLevelSelectionUpdate}
            />

            {/* {renderSelect(activeStair.floorLevels.map(level => ({ key: level.id, label: level.levelName })), "Select Bottom Level", "bottomLevelId", handleLevelSelectionUpdate)} */}
            {renderSelect(activeStair.floorLevels.map(level => ({ key: level.id, label: level.levelName })), "Select Top Level", "topLevelId", handleLevelSelectionUpdate)}
            {activeStair.bottomLevelId && activeStair.topLevelId &&
                <Form.Item
                    label="Landing Elevations Aligned With These Levels:" {...formItemLayout}
                >
                    <Checkbox.Group options={floorLevelSelections} onChange={(value) => handleStairValueUpdate('landingsLevels', value)} value={activeStair.landingsLevels} />
                </Form.Item>
            }
            <Form.Item
                label="Stair to Edge of Landing Offset :"
                {...formItemLayout}>
                <Input onChange={handleStairInputChange} name="stairEdgeOffset" value={activeStair.stairEdgeOffset} style={{ width: 200 }} />
            </Form.Item>
            <Form.Item
                label="Landing Platforms At Floor Levels"
                {...formItemLayout}>
                <Switch defaultChecked onChange={(value) => handleStairValueUpdate("landingsAtFloorLevels", value)} checked={activeStair.landingsAtFloorLevels} />
            </Form.Item>
            {activeStair.landingsAtFloorLevels &&
                <Form.Item label="Top of Landing Elevation Delta At Floor Levels:" {...formItemLayout}>
                    <Input onChange={handleStairInputChange} name="landingElevationDelta" value={activeStair.landingElevationDelta} style={{ width: 200 }} />
                </Form.Item>
            }
            {activeStair.landingsAtFloorLevels && renderSelect(constants.landingSupportTypes, "Landing Supports At Floor Levels", "floorLevelLandingSupportType", handleStairValueUpdate)}
            {/* {renderSelect(landingSupportTypes, "Landing Supports At Intermediate Levels", "intermediateLandingSupportType", handleStairValueUpdate)} */}

            <SelectBox
                value={activeStair.intermediateLandingSupportType}
                options={constants.landingSupportTypes}
                label="Landing Supports At Intermediate Levels"
                stateKey="intermediateLandingSupportType"
                callBack={handleStairValueUpdate}
            />

            {/* TODO: Imaplement length and delta handling */}
            <Form.Item label="Stairwell Length:"  {...formItemLayout}>
                <Radio.Group onChange={handleStairInputChange} value={activeStair.stairwellLengthHandling} name="stairwellLengthHandling">
                    <Radio style={radioStyle} value={"minimum"}>Minimum Possible</Radio>
                    <Radio style={radioStyle} value={"predetermined"}>Predetermined
                    </Radio>
                </Radio.Group>
                {activeStair.stairwellLengthHandling === "predetermined" &&
                    <span>
                        <Form.Item
                            label="Stairwell Length:"
                            validateStatus={isInFeetOrInches(activeStair.predeterminedStairwellLength) ? "" : "error"}
                            help={constants.feetOrInches}>
                            <Input onChange={handleStairInputChange} name="predeterminedStairwellLength" value={activeStair.predeterminedStairwellLength} style={{ width: 200 }} />
                        </Form.Item>
                        <Form.Item label="How to handle excess landing lengths:">
                            <Radio.Group onChange={handleStairInputChange} value={activeStair.stairwellExcessLengthHandling} name="stairwellExcessLengthHandling">
                                <Radio style={radioStyle} value={"increaseMidStoryLandings"}>Increase Odd Landing Widths</Radio>
                                <Radio style={radioStyle} value={"increaseStoryLandings"}>Increase Even Landing Widths</Radio>
                                <Radio style={radioStyle} value={"equalIncreaseLandings"}>Increase All Landings Equally</Radio>
                            </Radio.Group>
                        </Form.Item>

                    </span>}
            </Form.Item>

            <Form.Item label="Stairwell Width:"  {...formItemLayout}>
                <Radio.Group onChange={handleStairInputChange} value={activeStair.stairwellWidthHandling} name="stairwellWidthHandling">
                    <Radio style={radioStyle} value={"minimum"}>Minimum Possible</Radio>
                    <Radio style={radioStyle} value={"predetermined"}>Predetermined
                    </Radio>
                </Radio.Group>
                {activeStair.stairwellWidthHandling === "predetermined" &&
                    <span>
                        <Form.Item
                            label="Stairwell Width:"
                            validateStatus={isInFeetOrInches(activeStair.stairwellWidthF) ? "" : "error"}
                            help={constants.feetOrInches}>
                            <Input onChange={handleStairInputChange} name="stairwellWidthF" value={activeStair.stairwellWidthF} style={{ width: 200 }} />
                        </Form.Item>
                    </span>}
            </Form.Item>


            {/* //{renderLevelSelect(true)} */}

            {renderSelect(constants.railingOptions, "Guardrail Style: ", "railingPanelType", handleStairValueUpdate)}

            <SelectBox
                value={activeStair.interiorRailType}
                options={constants.railLocationTypes}
                label="Stair Interior Railing Type: "
                stateKey="interiorRailType"
                callBack={handleStairValueUpdate}
            />
            <SelectBox
                value={activeStair.exteriorRailType}
                options={constants.railLocationTypes}
                label="Stair Exterior Railing Type: "
                stateKey="exteriorRailType"
                callBack={handleStairValueUpdate}
            />

            <Form.Item {...formItemLayout} label="Clockwise Rotation on Ascent:">
                <Checkbox onChange={handleStairDirectionCheck} checked={!activeStair.isClockwise}></Checkbox>
            </Form.Item>
            <Form.Item
                label="Max Flight Rise:" {...formItemLayout}
                validateStatus={isInFeetOrInches(activeStair.maxFlightRise) ? "" : "error"}
                help={constants.feetOrInches}
            >
                <Input onChange={handleStairInputChange} name="maxFlightRise" value={activeStair.maxFlightRise} style={{ width: 200 }} />
            </Form.Item>
            <Button onClick={handleStoryEnter} type="primary" block>Enter</Button>

            <Collapse accordion onChange={(value) => handleStairValueUpdate("storiesDefinedBy", value)} activeKey={activeStair.storiesDefinedBy}>
                <Panel header="Define your own" key="define">
                    <Form.Item label="Number of Stories:">
                        <InputNumber min={1} max={1000} defaultValue={activeStair.storyCount} onChange={(value) => handleStairValueUpdate("storyCount", value)} name="storyCount" value={activeStair.storyCount} />
                    </Form.Item>
                    <Form.Item
                        label="Default Story Height:"
                        validateStatus={isInFeetOrInches(activeStair.defaultStoryHeight) ? "" : "error"}
                        help={constants.feetOrInches}>
                        <Input placeholder="12' 6 1/2" onChange={handleStairInputChange} name="defaultStoryHeight" value={activeStair.defaultStoryHeight} />
                    </Form.Item>
                    <Button onClick={handleStoryEnter} type="primary">Enter</Button>
                </Panel>
            </Collapse>

        </Form>
    );
}

export default CollectTopData