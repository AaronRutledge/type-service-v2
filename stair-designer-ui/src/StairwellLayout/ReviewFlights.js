import React from 'react';
import { Input, Table, Form, Button } from 'antd';
import SelectBox from '../components/SelectBox';
import * as constants from '../Util/constants';
import { formItemLayoutInline } from '../Util/styles';
import { format } from '../Util/format';
//floor levels are unique flights becuase they generally allow egress in and out of stair.  We use leels to anchor the stair heights and define the number of intermediate landings.
const ReviewFlights = (props) => {
    const { handleStairValueUpdate, handleFlightsTableInputChange, activeStair, handleUpdate } = props;
    const fracFormatter = (value) => format.FT.to.FT.IN.FRAC(32)(value);
    //handleFlightsTableInputChange(value, record, field) 
    const editFlight = (flight) => {
        return (

            <Form layout="inline">
                <Form.Item
                    label="Stair Width:"
                //validateStatus={isInFeetOrInches(activeStair.stairWidth) ? "" : "error"}
                //help={constants.feetOrInches} >
                >
                    <Input onChange={(value) => handleFlightsTableInputChange(value.target.value, flight, "stairWidth")} name="stairWidth" value={flight.stairWidth} style={{ width: 150 }} />
                </Form.Item>
                <Form.Item
                    label="Stair to Edge of Landing Offset:"
                >
                    <Input onChange={(value) => handleFlightsTableInputChange(value.target.value, flight, "stairEdgeOffset")} name="stairEdgeOffset" value={flight.stairEdgeOffset} style={{ width: 150 }} />
                </Form.Item>
                <SelectBox
                    style={formItemLayoutInline}
                    value={flight.interiorRailType}
                    options={constants.railLocationTypes}
                    label="Stair Interior Railing Type: "
                    stateKey="interiorRailType"
                    callBack={(key, value) => handleFlightsTableInputChange(value, flight, key)}
                />
                <SelectBox
                    style={formItemLayoutInline}
                    value={flight.exteriorRailType}
                    options={constants.railLocationTypes}
                    label="Stair Exterior Railing Type: "
                    stateKey="exteriorRailType"
                    callBack={(key, value) => handleFlightsTableInputChange(value, flight, key)}
                />
                <SelectBox
                    value={flight.landingSupportType}
                    options={constants.landingSupportTypes}
                    label="Landing Support Types"
                    stateKey="landingSupportType"
                    callBack={(key, value) => handleFlightsTableInputChange(value, flight, key)}
                />
            </Form>
        )
    }

    return (
        <div><Table dataSource={activeStair.flights} pagination={false} rowKey='flightId'
            columns={[{
                title: 'Flight',
                dataIndex: 'name',
                key: 'name',
                //render: (name, record) => (<Input value={name} onChange={(value) => handleFlightsTableInputChange(value, record, 'name')} />)
            },
            {
                title: 'Story',
                dataIndex: 'story',
                key: 'story',
                //render: (story, record) => (<Input value={story} onChange={(value) => handleFlightsTableInputChange(value, record, 'story')} />)
            },
            {
                title: 'Landing Width',
                dataIndex: 'landingWidth',
                key: 'landingWidth',
                render: (landingWidth, record) => (<Input value={landingWidth} onChange={(value) => handleFlightsTableInputChange(value.target.value, record, 'landingWidth')} />)
            },
            {
                title: 'Landing Length',
                dataIndex: 'landingLength',
                key: 'landingLength',
                render: (landingLength, record) => (<Input value={landingLength} onChange={(value) => handleFlightsTableInputChange(value.target.value, record, 'landingLength')} />)
            },
            {
                title: 'Dog Leg',
                dataIndex: 'dogLegLength',
                key: 'dogLegLength',
                render: (dogLegLength, record) => (<Input value={dogLegLength} onChange={(value) => handleFlightsTableInputChange(value.target.value, record, 'dogLegLength')} />)
                //render: (isDogLeg) => (<span>{isDogLeg}</span>)
            },
            {
                title: 'Risers',
                dataIndex: 'risers',
                key: 'risers',

            },
            {
                title: 'Rise Height',
                dataIndex: 'riseHeight',
                key: 'riseHeight',
                render: (riseHeight) => fracFormatter(riseHeight / 12)
            },
            {
                title: 'Riser Height',
                dataIndex: 'riserHeight',
                key: 'riserHeight',
                render: (riserHeight) => fracFormatter(riserHeight / 12)
            },
            {
                title: 'Run Length',
                dataIndex: 'runLength',
                key: 'runLength',
                render: (runLength) => fracFormatter(runLength / 12)
            }]}
            expandedRowRender={record => editFlight(record)} />
            <Button type="primary" block onClick={handleUpdate}>Enter</Button></div>
    );
}

export default ReviewFlights