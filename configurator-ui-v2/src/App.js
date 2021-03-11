import React, { useState, useEffect } from 'react';
import { Box, Heading } from 'grommet';
import { Formik, Form, Field } from 'formik'
import { TextField } from 'material-ui-formik-components/TextField'
import { Select } from 'material-ui-formik-components/Select'
import { makeStyles } from '@material-ui/core/styles';
import { Add } from 'grommet-icons';
import DataTable from 'react-data-table-component';
import DataTableExtensions from 'react-data-table-component-extensions';
import { format } from 'footinch';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import Input from '@material-ui/core/Input';
import 'react-data-table-component-extensions/dist/index.css';


const useStyles = makeStyles((theme) => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '45ch',
  },
}));
const formatter = format.FT.to.FT.IN.FRAC(32);

function App() {
  const [systemStairList, setSystemStairList] = useState([{ stairData: {}, flights: [{ flightName: "", elevation: 0, landingWidth: 0 }], stairNumber: 0 }]);
  const [activeStairId, setActiveStairId] = useState(0);

  const activeStair = getActiveStair();
  function getActiveStair() {
    if (systemStairList.some(e => e.stairNumber === activeStairId)) {
      return systemStairList.find(obj => {
        return obj.stairNumber === activeStairId
      })

    } else {
      setActiveStairId(systemStairList[0].stairNumber);
      return systemStairList[0];
    }
  }


  const flightColumns = [
    {
      name: 'Flight Number',
      selector: 'flightNumber'
    },
    {
      name: 'Flight Name',
      selector: 'flightName',
      cell: row => <Input defaultValue={row.flightName} onBlur={handleFlightUpdate({ field: "flightName", row })} />
    },
    {
      name: 'Elevation',
      selector: 'elevation',
      cell: row => <Input type='number' defaultValue={parseFloat(row.elevation)} onBlur={handleFlightUpdate({ field: "elevation", row })} />
    },
    {
      name: 'Landing Width',
      selector: 'landingWidth',
      cell: row => <Input type='number' defaultValue={parseFloat(row.landingWidth)} onBlur={handleFlightUpdate({ field: "landingWidth", row })} />
    },
    {
      name: 'Is Bridge',
      selector: 'isBridge',

      cell: row =>
        <Field
          options={[{ value: false, label: 'False' }, { value: true, label: 'True' }]}
          component={Select}
          defaultValue={row.isBridge}
          onChange={handleFlightUpdate({ field: "isBridge", row })} />
    },
    {
      name: 'Is Ddl',
      selector: 'isDdl',

      cell: row =>
        <Field
          options={[{ value: false, label: 'False' }, { value: true, label: 'True' }]}
          component={Select}
          defaultValue={row.isDdl}
          onChange={handleFlightUpdate({ field: "isDdl", row })} />
    },
    {
      name: 'Is Top Dog',
      selector: 'isTopDog',
      cell: row =>
        <Field
          options={[{ value: false, label: 'False' }, { value: true, label: 'True' }]}
          component={Select}
          defaultValue={row.isTopDogLeg}
          onChange={handleFlightUpdate({ field: "isTopDogLeg", row })} />
    },
    {
      name: 'Has Safety Gate',
      selector: 'hasSafetyGate',
      cell: row =>
        <Field
          options={[{ value: false, label: 'False' }, { value: true, label: 'True' }]}
          component={Select}
          defaultValue={row.hasSafetyGate}
          onChange={handleFlightUpdate({ field: "hasSafetyGate", row })} />
    },
    {
      name: 'Top Dog Leg Length',
      selector: 'topDogLegLength',
      cell: row => <Input type='number' defaultValue={parseFloat(row.topDogLegLength)} onBlur={handleFlightUpdate({ field: "topDogLegLength", row })} />
    },
    {
      name: 'Risers',
      selector: 'risers',
      cell: row => <Input defaultValue={row.risers} type='number' onBlur={handleFlightUpdate({ field: "risers", row })} />
    },
    {
      name: 'Stringer Thickness',
      selector: 'stringerThickness',
      cell: row => <Input defaultValue={row.stringerThickness} type='number' onBlur={handleFlightUpdate({ field: "stringerThickness", row })} />
    },
    {
      name: 'Stair Rise',
      selector: 'stairRise',
      //cell: row => <Input defaultValue={row.landingWidth} onBlur={handleFlightNameChange({ field: "landingWidth", row })} />
    },
    {
      name: 'Stair Run',
      selector: 'stairRun',
      //cell: row => <Input defaultValue={row.landingWidth} onBlur={handleFlightNameChange({ field: "landingWidth", row })} />
    },

    {
      name: 'Riser Height',
      selector: 'riserHeight',
      //cell: row => <Input defaultValue={row.landingWidth} onBlur={handleFlightNameChange({ field: "landingWidth", row })} />
    },
    {
      name: 'Calculated Length',
      selector: 'calculatedLength'
    },
    {
      name: 'Delete',
      cell: row => <button type="button" onClick={() => handleFlightDelete(row)}>Delete Flight</button>
    }
  ];


  const flightColumnsExport = [
    {
      name: 'Flight Number',
      selector: 'flightNumber'
    },
    {
      name: 'Flight Name',
      selector: 'flightName'
    },
    {
      name: 'Elevation',
      selector: 'elevation'
    },
    {
      name: 'Landing Width',
      selector: 'landingWidth'
    },
    {
      name: 'Is Ddl',
      selector: 'isDdl'
    },
    {
      name: 'Is Top Dog',
      selector: 'isTopDog'
    },
    {
      name: 'Top Dog Leg Length',
      selector: 'topDogLegLength'
    },
    {
      name: 'Risers',
      selector: 'risers'
    },
    {
    name: 'Stringer Thickness',
    selector: 'stringerThickness'
    },
    {
      name: 'Stair Rise',
      selector: 'stairRise',
      //cell: row => <Input defaultValue={row.landingWidth} onBlur={handleFlightNameChange({ field: "landingWidth", row })} />
    },
    {
      name: 'Stair Run',
      selector: 'stairRun',
      //cell: row => <Input defaultValue={row.landingWidth} onBlur={handleFlightNameChange({ field: "landingWidth", row })} />
    },

    {
      name: 'Riser Height',
      selector: 'riserHeight',
      //cell: row => <Input defaultValue={row.landingWidth} onBlur={handleFlightNameChange({ field: "landingWidth", row })} />
    },
    {
      name: 'Calculated Length',
      selector: 'calculatedLength'
    }
  ];
  const conditionalRowStyles = [

    {
      when: row => row.calculatedLength > activeStair.stairData.stairwellLength,
      style: {
        backgroundColor: 'rgba(242, 38, 19, 0.9)',
      }
    },
    {
      when: row => row.calculatedLength < activeStair.stairData.stairwellLength,
      style: {
        backgroundColor: 'rgba(247, 202, 24, .9)',
      }
    },
    {
      when: row => row.calculatedLength == activeStair.stairData.stairwellLength,
      style: {
        backgroundColor: 'rgba(0, 177, 106, 0.9)',
      }
    },
  ];

  const updateStair = (updatedStair) => {

    const putMethod = {
      method: 'PUT', // Method itself
      headers: {
        'Content-type': 'application/json; charset=UTF-8' // Indicates the content 
      },
      body: JSON.stringify(updatedStair) // We send data in JSON format
    }

    fetch(`https://localhost:44312/stairConfigurator/`, putMethod).catch(err => console.log(err)) // Do something with the error

    const stairId = updatedStair.stairNumber;
    var stairListCopy = cloneDeep(systemStairList);
    var stairIndex = stairListCopy.findIndex(el => el.stairNumber === stairId);
    stairListCopy[stairIndex] = updatedStair;
    setSystemStairList(stairListCopy)
  }

  const addStair = (newStair) => {
    const stairId = newStair.stairNumber;
    var stairListCopy = cloneDeep(systemStairList);
    stairListCopy.push(newStair);
    setSystemStairList(stairListCopy);
    setActiveStairId(stairId);
  }

  useEffect(() => {
    updateSystemStairList()
  }, [])

  const updateSystemStairList = () => {
    fetch("https://localhost:44312/stairConfigurator")
      .then(res => res.json())
      .then(
        (result) => {
          if (result.length > 0) {
            setSystemStairList(result);
            //setActiveStairId(result[0])
          }

        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          console.log(error);
        }
      )
  }


  const AppBox = (props) => (
    <Box
      tag='header'
      margin='medium'
      border={true}
      wrap={true}
      direction='row'
      align='center'
      background='light-2'
      pad={{ vertical: 'small', horizontal: 'medium' }}
      elevation='medium'
      {...props}
    />
  );

  const classes = useStyles();

  function handleStairSelect(e) {
    setActiveStairId(e.target.value)
  }

  function handleFlightDelete(rowFieldData) {
    console.log('out: ', JSON.stringify(rowFieldData))
    var stairListCopy = cloneDeep(systemStairList);
    const stairIndex = stairListCopy.findIndex(el => el.stairNumber === activeStairId);
    const flightIndex = stairListCopy[stairIndex].flights.findIndex(el => el.flightName === rowFieldData.flightName);
    stairListCopy[stairIndex].flights.splice(flightIndex, 1);

    setSystemStairList(stairListCopy);
  }

  const handleFlightUpdate = rowFieldData => (event) => {

    var stairListCopy = cloneDeep(systemStairList);
    //find index of current stair
    const stairIndex = stairListCopy.findIndex(el => el.stairNumber === activeStairId);

    //sort by elevation for our calcs
    stairListCopy[stairIndex].flights.sort((a, b) => a.elevation - b.elevation);
    //find index of flight
    const flightIndex = stairListCopy[stairIndex].flights.findIndex(el => el.flightName === rowFieldData.row.flightName);
    //TODO:  This has frown.  Consider a switch statement
    var fieldValue = (rowFieldData.field == "isTopDogLeg" || rowFieldData.field == "isDdl" || rowFieldData.field == "flightName"|| rowFieldData.field == "isBridge"|| rowFieldData.field == "hasSafetyGate") ? event.target.value : parseFloat(event.target.value);
    console.log('field value is ', fieldValue)
    stairListCopy[stairIndex].flights[flightIndex][rowFieldData.field] = fieldValue;

    //var currentFlightData = stairListCopy[stairIndex].flights[flightIndex];

    for (var i = 0; i < stairListCopy[stairIndex].flights.length; i++) {
      var flight = stairListCopy[stairIndex].flights[i];

      flight.stairRise = (i == 0) ?
        (flight.elevation - stairListCopy[stairIndex].stairData.baseElevation)
        : (flight.elevation - stairListCopy[stairIndex].flights[i - 1].elevation);

      flight.flightNumber = i + 1;
      //flight.risers = rowFieldData.field == "risers" ? fieldValue : (Math.ceil(flight.stairRise / 7));
      flight.riserHeight = flight.stairRise / flight.risers;
      flight.stairRun = (flight.risers - 1) * 11;
      var previousLandingWidth = 0;
      if (i !== 0) {
        previousLandingWidth = stairListCopy[stairIndex].flights[i - 1].landingWidth;
      } else {
        previousLandingWidth = stairListCopy[stairIndex].stairData.baseLandingWidthToWall;
      }

      flight.calculatedLength = flight.stairRun
        + (flight.isDdl ? 11 : 0) + (flight.isTopDogLeg ? flight.topDogLegLength : 0)
        + flight.landingWidth
        + previousLandingWidth;


    }

    //calculate rise.
    //check if this is the first flight.  If it is use stair base elevation.  If not get previous flight elevation for delat

    //loop through flights and recalc everything from bottom up



    setSystemStairList(stairListCopy);
  }

  // function handleFlightNameChange(e, row) {
  //   console.log('out: ', JSON.stringify(row))
  // }

  function handleCreateNewStair() {
    const defaultStairObject = { stairData: {}, flights: [] }

    const postMethod = {
      method: 'POST', // Method itself
      headers: {
        'Content-type': 'application/json; charset=UTF-8' // Indicates the content 
      },
      body: JSON.stringify(defaultStairObject) // We send data in JSON format
    }

    fetch(`https://localhost:44312/stairConfigurator/`, postMethod)
      .then(res => res.json())
      .then((result) => { addStair(result) })
      .catch(err => console.log(err)) // Do something with the error
  }

  function handleDeleteStair() {
    const deleteMethod = {
      method: 'DELETE', // Method itself
      headers: {
        'Content-type': 'application/json; charset=UTF-8' // Indicates the content 
      },
    }

    fetch(`https://localhost:44312/stairConfigurator/${activeStairId}`, deleteMethod)
      .then(res => res.json())
      .then((result) => { addStair(result) })
      .catch(err => console.log(err)) // Do something with the error
  }

  return (
    <AppBox>

      <Box fill="vertical" >
        <Heading level="2" size="medium" >Overall Stair Geometry and Type</Heading>
        <Box fill="horizontal">

          <Formik
            initialValues={activeStair}
          >
            <Form>
              <Field
                required
                fullWidth={false}
                style={{ minWidth: 120 }}
                name="stairNumber"
                label="Select Stair"
                options={systemStairList.map(a => ({ value: a.stairNumber, label: `${a.stairNumber}-${a.stairData.stairName ? a.stairData.stairName : ''}` }))}
                component={Select}
                onChange={handleStairSelect}
              />
              <div>
                <button onClick={handleCreateNewStair}>New Stair</button>
                <button type="button" onClick={handleDeleteStair}>Delete Stair</button>
              </div>

            </Form>
          </Formik>

        </Box>
        <Formik
          initialValues={activeStair.stairData}
          onSubmit={values => {
            updateStair(Object.assign({}, activeStair, { stairData: values }))
          }}
        >
          {formik => (

            <Form >


              <Field
                margin="dense"
                name="stairName"
                label="Stair Name"
                component={TextField}
                className={classes.textField}
              />
              <Field
                margib="dense"
                name="orientation"
                label="Orientation"
                options={[{ value: 'CLOCKWISE', label: 'Clockwise' }, { value: 'COUNTERCLOCKWISE', label: 'Counterclockwise' }]}
                fullWidth={false}
                style={{ minWidth: 200 }}
                component={Select}
              />
              <Box direction="row">
                <Field
                  type='number'
                  margin="dense"
                  name="baseLandingWidthToWall"
                  label="Base Landing Width To Wall"
                  component={TextField}
                  className={classes.textField}
                />
                <Field
                  type='number'
                  margin="dense"
                  name="baseElevation"
                  label="Base Elevation"
                  component={TextField}
                  className={classes.textField}
                />
                <Field
                  type='number'
                  margin="dense"
                  name="stairEdgeClearance"
                  label="Stair Edge Clearance"
                  component={TextField}
                  className={classes.textField}
                />
              </Box>



              <Box direction="row">
                <Field
                  type='number'
                  name="stairwellWidth"
                  fullWidth={false}
                  margin="dense"
                  label="Stairwell Width"
                  component={TextField}
                  className={classes.textField}
                />
                <Field
                  type='number'
                  name="stairwellLength"
                  margin="dense"
                  fullWidth={false}
                  label="Stairwell Length"
                  component={TextField}
                  className={classes.textField}
                />
                <Field
                  type='number'
                  name="stairWidth"
                  margin="dense"
                  fullWidth={false}
                  label="Stair Width"
                  component={TextField}
                  className={classes.textField}
                />
              </Box>

              <button type="submit" disabled={!formik.dirty}>
                Update
              </button>
            </Form>
          )}
        </Formik>

      </Box>
      <Box fill="horizontal" margin={{ "top": "20px" }}>
        <Heading level="2" size="medium" >Flights</Heading>
        <Formik
          initialValues={{
            flightName: '',
            elevation: 0,
          }}
          onSubmit={values => {
            updateStair(Object.assign({}, activeStair, { flights: [...activeStair.flights, values] }));
          }}
        >
          {formik => (

            <Form >
              <Field
                name="flightName"
                label="Flight Name"
                component={TextField}
                margin="dense" fullWidth={false}
                className={classes.textField} />
              <Field
                type='number'
                name="elevation"
                label="Top Elevation"
                component={TextField}
                margin="dense" fullWidth={false}
                className={classes.textField} />
              <Field
                type='number'
                name="landingWidth"
                label="Landing Width"
                component={TextField}
                margin="dense" fullWidth={false}
                className={classes.textField} />
              <Field
                type='number'
                name="risers"
                label="Risers"
                component={TextField}
                margin="dense" fullWidth={false}
                className={classes.textField} />

              <button type="submit" disabled={!formik.dirty}>
                <Add />
              </button>
            </Form>
          )}
        </Formik>
      </Box>
      <Formik>
        <Form>
          <DataTable
            title="Flights"
            striped={true}
            columns={flightColumns}
            data={activeStair.flights.sort((a, b) => b.elevation - a.elevation)}
            conditionalRowStyles={conditionalRowStyles}
          //expandableRows
          //expandableRowsComponent={<ParameterForm partData={props.values.data.partProperties} drivingLayoutPartTypeId={activeDrivingLayoutPartTypeId} assemblyLocation="root" />}
          />
          <button onClick={() => updateStair(activeStair)}>
            Update
              </button>
        </Form>
      </Formik>
{/* TODO: Add to tab */}
      <DataTableExtensions
        columns={flightColumnsExport}
        data={activeStair.flights.sort((a, b) => b.elevation - a.elevation)}>
        <DataTable
          title="Flights"
          striped={true}

          //conditionalRowStyles={conditionalRowStyles}
        //expandableRows
        //expandableRowsComponent={<ParameterForm partData={props.values.data.partProperties} drivingLayoutPartTypeId={activeDrivingLayoutPartTypeId} assemblyLocation="root" />}
        />
      </DataTableExtensions>
    </AppBox>


  );
}

export default App;
