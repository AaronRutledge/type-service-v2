import React, { Component } from 'react';
import './App.css';
import { HashRouter, Route } from 'react-router-dom';
import { Drawer, Form, Input, Button } from 'antd';
import { postAjax } from './Util/ajaxUtils';

import StairwellLayoutContainer from '../src/StairwellLayout/StairwellLayoutContainer';
import StairwellEditContainer from './StairwellEdit/StairwellEditContainer';
import { connect } from 'react-redux';
import {awsApiUrl} from './Util/constants'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: false
    }
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handlePostStair = this.handlePostStair.bind(this);
  }

  toggleDrawer() {
    this.setState(
      {
        drawerVisible: !this.state.drawerVisible
      })
  }

  handlePostStair() {
    const stairWellData = {
      projectId: this.props.projectGuid,
      configurationJson: JSON.stringify(this.props.activeStair),
      stairwellId: this.props.activeStair.stairName
    };
  //TODO: need callback to notfy ui of success
  console.log('out', JSON.stringify(this.props.activeStair))
    postAjax(awsApiUrl, stairWellData);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({ [name]: value });
  }

  render() {

    return (
      <div className="App">
        <Drawer
          title="Project Data"
          placement="right"
          closable={false}
          onClose={this.toggleDrawer}
          visible={this.state.drawerVisible}
        >

          <Form>
            <Form.Item label="Project Name:">
              <Input onChange={this.handleInputChange} name="projectName" />

            </Form.Item>
          </Form>
          <Button onClick={this.handlePostStair}>Submit Stair</Button>

        </Drawer>
        <HashRouter>
          <div>
            {/* <Route exact path="/" render={() => <div>hello</div>} /> */}
            <Route exact path="/" render={() => <StairwellLayoutContainer toggleDrawer={this.toggleDrawer} />} />
            <Route path="/edit" render={() => <StairwellEditContainer />} />
          </div>
        </HashRouter>
      </div >
    );
  }
}



const mapStateToProps = (state) => ({
  activeStair: state.activeStair,
  projectGuid: state.project.projectGuid
});
const mapDispatchToProps = (dispatch) => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(App)