import React from 'react';
import { InputNumber, Input, Button, Table, Icon, Form, Divider, Tag } from 'antd';
//import { parse } from 'footinch';
import { parse } from '../Util/parse';
import { format } from '../Util/format';
import { formItemLayoutInline } from '../Util/styles'
//floor levels are unique flights becuase they generally allow egress in and out of stair.  We use leels to anchor the stair heights and define the number of intermediate landings.
const CollectFloorLevelData = (props) => {
    const { activeStair, addStory, handleElevationChange, handleChangeStoryFlightCount, handleLandingElevationDeltaChange, checkFlighGeometry, handleStepClick } = props;
    const fracFormatter = (value) => format.FT.to.FT.IN.FRAC(32)(value);

    let sortedLevels = Object.assign([], activeStair.stories)
        .sort((a, b) => parse.F(a.elevation) - parse.F(b.elevation));

    const renderFlights = (record) => {
        const storyId = record.storyId;
        const storyFlights = activeStair.flights.filter(x => x.story === storyId);
        const flightRows = storyFlights.map((flight, index) => {
            const isBottomFlight = (index === 0);
            const isTopFlight = (index === storyFlights.length - 1);
            
            return (
                <span key={index}>

                    <h3>{flight.name}</h3>

                    <Form.Item label="Top Elevation:"  >
                        {/* TODO: get list of names from app and ensure this is unique */}
                        <Input onChange={(value) => handleElevationChange(flight.flightId, value.target.value, true)} name="topElevation" value={flight.topElevation} style={{ width: 200 }} disabled={isTopFlight} />
                    </Form.Item>
                    <Form.Item label="Bottom Elevation:"  >
                        {/* TODO: get list of names from app and ensure this is unique */}
                        <Input onChange={(value) => handleElevationChange(flight.flightId, value.target.value, false)} name="bottomElevation" value={flight.bottomElevation} style={{ width: 200 }} disabled={isBottomFlight} />
                    </Form.Item>

                    <Divider />
                </span>
            );
        })
        return (
            <Form layout="inline">
                {flightRows}
            </Form>
        )
    }

    return (
        <span>

            <Table dataSource={sortedLevels} pagination={false} rowKey='storyId'
                columns={[{
                    title: 'Story',
                    dataIndex: 'storyName',
                    key: 'storyName',
                    //render: (storyName, record) => (<Input value={storyName} onChange={(value) => handleTableInputChange(value, record, 'storyName')} />)
                },
                {
                    title: 'Elevation',
                    dataIndex: 'elevation',
                    key: 'elevation',
                    //render: (elevation, record) => (<Input placeholder="Elevation" value={elevation} onChange={(value) => handleTableInputChange(value, record, 'elevation')} />)
                },
                {
                    title: 'Landing Elevation Delta',
                    dataIndex: 'landingElevationDelta',
                    key: 'landingElevationDelta',
                    render: (landingElevationDelta, record) => (<Input placeholder="" value={landingElevationDelta} onChange={(value) => handleLandingElevationDeltaChange(record.storyId, value.target.value)} onBlur={checkFlighGeometry} />)
                },
                {
                    title: 'Flights',
                    dataIndex: 'flights',
                    key: 'flights',
                    render: (flights, record) => (<InputNumber min={0} max={1000} value={flights} onChange={(value) => handleChangeStoryFlightCount(record.storyId, value)} />)
                }]}
                expandedRowRender={record => renderFlights(record)}
                footer={() => <Button onClick={addStory} type="dashed"><Icon type="plus" />Add Level</Button>}
            />


            {activeStair.stories.length > 0 &&
                <Button onClick={handleStepClick} type="primary" block>Proceed to Flight Review</Button>
            }
        </span>
    );
}

export default CollectFloorLevelData
