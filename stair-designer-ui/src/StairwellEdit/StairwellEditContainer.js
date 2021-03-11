import React, { Component } from 'react';
import { Row, Col, Card, Select } from 'antd';
import { connect } from 'react-redux';
import { updateCurrentStairwell, getStairwell } from '../actions/stairsActions';
import { getProject } from '../actions/projectActions';
import {
  withRouter
} from 'react-router-dom';

class StairwellEditContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
    this.handleStairSelect = this.handleStairSelect.bind(this);
  };
  componentWillMount() {
    this.props.getProject();
  }

  handleStairSelect(value) {
    this.props.getStairwell(value);
    this.props.history.push("/");
  }

  render() {
    const stairs = this.props.project.stairwells.map(x => x.stairName);
    const renderStairSelect = () => {
      const options = stairs.map(stair => <Select.Option value={stair}>{stair}</Select.Option>);
      return (

        <Select style={{ width: 120 }} onChange={this.handleStairSelect}>
          {options}
        </Select>

      )
    }

    return (
      <Row>
        <Col lg={4}></Col>
        <Col lg={16}>
          <Card title="Stairwell Edit" style={{ margin: 20 }}>
            {renderStairSelect()}
            <span>{JSON.stringify(this.state.currentStair)}</span>
          </Card>
        </Col>
        <Col lg={4} />
      </Row>
    );
  }
}

//export default withRouter(StairwellEditContainer);

const mapStateToProps = (state) => ({
  activeStair: state.activeStair,
  project: state.project
});
const mapDispatchToProps = (dispatch) => ({
  updateCurrentStairwell: (stair) => dispatch(updateCurrentStairwell(stair)),
  getProject: () => dispatch(getProject()),
  getStairwell: (stairName) => dispatch(getStairwell(stairName))
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StairwellEditContainer));