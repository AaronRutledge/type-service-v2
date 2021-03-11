import React, { useState, useEffect } from 'react';
import './App.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
//import Field from 'react-bootstrap/Form/'
import DataTable from 'react-data-table-component';
import { Formik, Field, Form } from 'formik';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import { baseKeys, flightKeys } from './util/configuratorSchema';

function PartCatalogTable() {
    const [error, setError] = useState(null);
    const [partCatalogData, setPartCatalog] = useState([{ partTypeId: 1, partProperties: { isLayoutPart: false, isAssembly: false }, partParameterList: [], assemblyLocationList: [{locationId:""}] }]);
    const [activePartType, setActivePartType] = useState(1);
    const [activeLocation, setActiveLocation] = useState("");
    const [activeDrivingLayoutPartTypeId, setActiveDrivingLayoutPartTypeId] = useState("");
    const [show, setShow] = useState(false);

//TODO:  This could bomb if any assemblies do not have assembly locations.  SHould add some null checking.
    const containingAssemblyByLocationId = (location) => assemblyParts.find(part=>part.assemblyLocationList.some(item=>item.locationId===location));

    const activePartData = partCatalogData.find(part => part.partTypeId == activePartType)
    const layoutParts = partCatalogData.filter(part => part.partProperties.isLayoutPart);
    const assemblyParts = partCatalogData.filter(part => part.partProperties.isAssembly);
    const getPartByTypeId = (typeId) => partCatalogData.find(part => part.partTypeId === typeId);
    //const getPartParameterResolutionItem = (assemblyLocationId, partTypeId, parameterId)=>console.log(`location is ${assemblyLocationId} and part type is ${partTypeId} and parameterId is ${parameterId}`)


    const updateProperty = (updatedPart) => {
        console.log("updating part: ", JSON.stringify(updatedPart))
        const partId = updatedPart.partTypeId;
        var catalogCopy = cloneDeep(partCatalogData);
        var partIndex = catalogCopy.findIndex(el => el.partTypeId === partId);
        catalogCopy[partIndex] = updatedPart;

        setPartCatalog(catalogCopy)

    }

    const updateParameter = (partTypeId, parameterId, locationId, values) => {
        var catalogCopy = cloneDeep(partCatalogData);
        catalogCopy
            .find(el => el.partTypeId === partTypeId)
            .partParameterList[catalogCopy.find(el => el.partTypeId === partTypeId).partParameterList.findIndex(el => el.parameterId === parameterId)]
            .partParameterResolutionDictionary[activeLocation] = values;

        setPartCatalog(catalogCopy)

    }
    const updateAssemblyLocation = (partId, updatedAssemblyLocation) => {
        var catalogCopy = cloneDeep(partCatalogData);
        catalogCopy
            .find(el => el.partTypeId === partId)
            .assemblyLocationList[catalogCopy.find(el => el.partTypeId === partId).assemblyLocationList.findIndex(el => el.locationId === updatedAssemblyLocation.locationId)]
            = updatedAssemblyLocation;

        setPartCatalog(catalogCopy)

    }

    useEffect(() => {
        updatePartCatalogData()
    }, [])

    const updatePartCatalogData = () => {
        fetch("https://localhost:44312/partcatalog")
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(result)
                    setPartCatalog(result);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    setError(error);
                }
            )
    }
    const handleClose = () => setShow(false);
    const handleParameterEditModalShow = (activePartId, activeLocation, drivingSketch) => {
        
        setActiveLocation(activeLocation)
        setActivePartType(activePartId)
        setActiveDrivingLayoutPartTypeId(drivingSketch)
        setShow(true);
    }


    const parameterColumns = [
        {
            name: 'Parameter Name',
            selector: 'name'
        },
        {
            name: 'Resolution',
            cell: row => <div style={{ fontWeight: "bold" }}>{get(row, `partParameterResolutionDictionary[${activeLocation}].resolutionType`, '--')}</div>
        },
        {
            name: 'Driving Param',
            cell: row => <div style={{ fontWeight: "bold" }}>{get(row, `partParameterResolutionDictionary[${activeLocation}].drivingInputName`, '--')}</div>
        }


    ]

    const assemblyColumns = [
        {
            name: 'Occurence Name',
            selector: 'occurrenceName'
        },
        {
            name: 'Position Type',
            selector: 'positionType'
        },
        {
            name: 'Part Type Id',
            selector: 'partTypeId'
        },
        {
            name: 'Part Name',
            cell: row => <div style={{ fontWeight: "bold" }}>{getPartByTypeId(row.partTypeId).partProperties.partName}</div>
        }
    ]


    const columns = [
        {
            name: 'Part Type Id',
            selector: 'partProperties.partTypeId'
        },
        {
            name: 'Part Name',
            selector: 'partProperties.partName'
        },
        {
            name: 'Bill Of Material Type',
            selector: 'billOfMaterialType'
        },
        {
            name: 'Layout Part',
            selector: 'drivingLayoutPartTypeId',
            cell: row => <div style={{ fontWeight: "bold" }}>{getPartByTypeId(row.drivingLayoutPartTypeId).partProperties.partName}</div>
        },

        // {layoutParts.map((item) => <option value={item.partProperties.partTypeId}>{item.partProperties.partName}</option>)}

        // {
        //     name: 'Is Layout Part',
        //     selector: 'partProperties.isLayoutPart',
        //     cell: row => <div style={{ fontWeight: "bold" }}>{row.partProperties.isLayoutPart.toString()}</div>
        // },
        // {
        //     name: 'Is Assembly',
        //     selector: 'partProperties.isAssembly',
        //     cell: row => <div style={{ fontWeight: "bold" }}>{row.partProperties.isAssembly.toString()}</div>
        // },
        {
            name: 'File Path',
            selector: 'partProperties.filePath'
        }

    ]

    const ExpandedAssemblyComponent = (data) => {
        return (
            <div style={{ width: '95%', float: 'right' }}>
                <ComponentPropertyForm values={data} showAssemblyConfigOptions={true} />
                {/* {data.data.partParameterList &&
                    <DataTable
                        title={`Part ${data.data.partTypeId} Parameters`}
                        striped={true}
                        highlightOnHover={true}
                        columns={parameterColumns}
                        data={data.data.partParameterList}
                        expandableRows
                        expandableRowsComponent={<ParameterForm partData={data.data} />}
                    />
                } */}
                {data.data.assemblyLocationList &&
                    <DataTable
                        title={`Part ${data.data.partTypeId} Assembly Locations`}
                        striped={true}
                        highlightOnHover={true}
                        columns={assemblyColumns}
                        data={data.data.assemblyLocationList}
                        expandableRows
                        expandableRowsComponent={<AssemblyForm partTypeId={data.data.partTypeId} partData={data.data} />}
                    />
                }
            </div>

        )
    }

    const ComponentPropertyForm = (props) => {
        const initialValues = props.selectedComponent ? props.selectedComponent : props.values.data;
      
        return (
            <React.Fragment>
                <Formik
                    initialValues={initialValues}
                    onSubmit={(values) => {
                        values.drivingLayoutPartTypeId = parseInt(values.drivingLayoutPartTypeId, 10)
                        values.isRootAssembly = (values.isRootAssembly === "true");
                        console.log(values)
                        const putMethod = {
                            method: 'PUT', // Method itself
                            headers: {
                                'Content-type': 'application/json; charset=UTF-8' // Indicates the content 
                            },
                            body: JSON.stringify(values) // We send data in JSON format
                        }

                        fetch(`https://localhost:44312/partcatalog/`, putMethod)
                            .then(updateProperty(values)) // Manipulate the data retrieved back, if we want to do something with it
                            .catch(err => console.log(err)) // Do something with the error
                        //need to update table data with new values

                    }}
                >
                    {({
                        values,
                        handleSubmit,
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <div style={{ float: "left", marginRight: "20px" }}>
                                <label htmlFor="billOfMaterialType">Bill Of Material Type</label>
                                <Field
                                    as="select"
                                    name="billOfMaterialType"
                                    value={values.billOfMaterialType}
                                >
                                    <option value="SAWCUT">SAWCUT</option>
                                    <option value="PLATEPLASMA">PLATEPLASMA</option>
                                    <option value="TUBELASER">TUBELASER</option>
                                    <option value="FORMED">FORMED</option>
                                    <option value="BOUGHT">BOUGHT</option>
                                    <option value="SHOPMADE">SHOPMADE</option>
                                    <option value="SHOPASSEMBLED">SHOPASSEMBLED</option>
                                    <option value="FIELDASSEMBLED">FIELDASSEMBLED</option>
                                    <option value="OMIT">OMIT</option>
                                    <option value="UNASSIGNED">UNASSIGNED</option>
                                </Field>
                            </div>
                            <div style={{ float: "left", marginRight: "20px" }}>
                                <label htmlFor="modelOutputType">Model Output Type</label>
                                <Field
                                    as="select"
                                    name="modelOutputType"
                                    value={values.modelOutputType}
                                >
                                     <option value="">NONE</option>
                                    <option value="DXF">DXF</option>
                                    <option value="STL">STL</option>
                                    <option value="PDF">PDF</option>
                                    <option value="DWG">DWG</option>
                                   
                                </Field>
                            </div>
                            { (props.showAssemblyConfigOptions) &&
                                <React.Fragment>


                                    <div style={{ float: "left", marginRight: "20px" }}>
                                        <label htmlFor="drivingConfigObjectType">Configurator Object Type</label>
                                        <Field
                                            as="select"
                                            name="drivingConfigObjectType"
                                            value={values.drivingConfigObjectType}
                                        >
                                            <option value="base">base</option>
                                            <option value="flight">flight</option>
                                        </Field>
                                    </div>

                                    <div style={{ float: "left", marginRight: "20px" }}>

                                        <label htmlFor="drivingConfigObjectSelector">Configurator Object Selector Function</label>

                                        <Field
                                            as="textarea"
                                            rows="7" cols="80"
                                            name="drivingConfigObjectSelector"
                                            placeholder="function out(config, positionType) {return {config.flights[postionType]}}"
                                            value={values.drivingConfigObjectSelector}
                                        />
                                    </div>
                                    <div style={{ float: "left", marginRight: "20px" }}>
                                        <label htmlFor="isRootAssembly">Is Root Assembly</label>
                                        <Field
                                            as="select"
                                            name="isRootAssembly"
                                            value={values.isRootAssembly}
                                        >
                                            <option value={true}>yes</option>
                                            <option value={false}>no</option>
                                        </Field>
                                    </div>

                                </React.Fragment>
                            }


                            {/* {values.partProperties.isAssembly &&
                            <div style={{ float: "left", marginRight: "20px" }}>
                                <label htmlFor="drivingLayoutPartTypeId">Driving Layout Part</label>
                                <Field
                                    as="select"
                                    name="drivingLayoutPartTypeId"
                                    value={values.drivingLayoutPartTypeId}
                                >
                                    <option value=""></option>
                                    {layoutParts.map((item) => <option value={item.partProperties.partTypeId}>{item.partProperties.partName}</option>)}
                                </Field>
                            </div>
                        } */}

                            <div style={{ float: "", marginRight: "20px" }}>
                                <button type="submit">Update</button>
                            </div>

                        </form>
                    )}
                </Formik>
                {initialValues.isRootAssembly &&
                    <DataTable
                        title={`Part ${props.values.data.partTypeId} Parameters at root`}
                        striped={true}
                        highlightOnHover={true}
                        columns={parameterColumns}
                        data={props.values.data.partParameterList}
                        expandableRows
                        expandableRowsComponent={<ParameterForm partData={props.values.data.partProperties} drivingLayoutPartTypeId={activeDrivingLayoutPartTypeId} assemblyLocation="root" />}
                    />

                }
            </React.Fragment>

        )
    }


    const AssemblyForm = (props) => {
        const partAtLocation = getPartByTypeId(props.data.partTypeId)

        return (
            <div style={{ width: '95%', float: 'right' }}>

                <Formik
                    initialValues={props.data}
                    onSubmit={(values) => {

                        values.drivingLayoutPartTypeId = parseInt(values.drivingLayoutPartTypeId, 10)
                        const putMethod = {
                            method: 'PUT', // Method itself
                            headers: {
                                'Content-type': 'application/json; charset=UTF-8' // Indicates the content 
                            },
                            body: JSON.stringify(values) // We send data in JSON format
                        }

                        fetch(`https://localhost:44312/partcatalog/${props.partTypeId}/assemblylocation/${values.locationId}`, putMethod)
                            .then(updateAssemblyLocation(props.partTypeId, values)) // Manipulate the data retrieved back, if we want to do something with it
                            .catch(err => console.log(err)) // Do something with the error
                        //need to update table data with new values

                    }}
                >
                    {({
                        values,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                    }) => (
                        <form onSubmit={handleSubmit}>
                            {/* <div style={{ float: "left", marginRight: "20px" }}>
                                <label htmlFor="positionType">Position Type</label>
                                <Field
                                    as="select"
                                    name="positionType"
                                    value={values.positionType}
                                >
                                    <option value="FIXED">FIXED</option>
                                    <option value="PATTERNED">PATTERNED</option>
                                </Field>
                            </div> */}
                            <div style={{ float: "left", marginRight: "20px" }}>
                                <label htmlFor="locationType">Location Type Parameter</label>
                                <Field
                                    as="input"
                                    name="locationType"
                                    value={values.locationType}
                                />
                            </div>

                            <React.Fragment>
                                <div style={{ float: "left", marginRight: "20px" }}>
                                    <label htmlFor="resolutionType">Resolution Type</label>
                                    <Field
                                        as="select"
                                        name="resolutionType"
                                        value={values.resolutionType}
                                    >
                                        <option value="DEFALUT">DEFAULT</option>
                                        <option value="EVALUATELAMBDA">EVALUATE LAMBDA</option>
                                    </Field>
                                </div>

                                {(values.resolutionType === "EVALUATELAMBDA") &&
                                    <div style={{ float: "left", marginRight: "20px" }}>
                                        <label htmlFor="resolutionType">Lambda Function</label>
                                        <Field
                                            as="textarea"
                                            rows="7" cols="80"
                                            name="lambdaFunction"
                                            placeholder="function out(config, sketch, positionType) {return {distance: , delete: false}}"
                                            // onChange={handleChange}
                                            // onBlur={handleBlur}
                                            value={values.lambdaFunction}
                                        />
                                    </div>
                                }
                            </React.Fragment>

                            <div style={{ float: "", marginRight: "20px" }}>
                                <button type="submit" disabled={isSubmitting}>
                                    Update
           </button>
                            </div>
                        </form>
                    )}
                </Formik>
                {/* <DataTable
                    title={`Part ${partAtLocation.partTypeId} Parameters`}
                    striped={true}
                    highlightOnHover={true}
                    columns={parameterColumns}
                    data={partAtLocation.partParameterList}
                    expandableRows
                    expandableRowsComponent={<ParameterForm partData={partAtLocation.partProperties} assemblyLocationId={props.data.locationId} drivingLayoutPartTypeId={props.partData.drivingLayoutPartTypeId}/>}
                /> */}
                <button onClick={() => handleParameterEditModalShow(partAtLocation.partTypeId, props.data.locationId, props.partData.drivingLayoutPartTypeId)}>Edit Parameters</button>
            </div>
        )
    }


    const ParameterForm = (props) => {
        const assemblyLocation = props.assemblyLocation ? props.assemblyLocation : activeLocation;
        var partData = getPartByTypeId(props.partData.partTypeId);
        var containingAssemblyPart = containingAssemblyByLocationId(assemblyLocation);
console.log('containing assembly is ', JSON.stringify(containingAssemblyPart))

        const configProperties = containingAssemblyPart && containingAssemblyPart.drivingConfigObjectType === "flight" ? flightKeys : baseKeys;
        const layoutSketchParameters = props.partData.isAssembly ?
            getPartByTypeId(partData.drivingLayoutPartTypeId).partParameterList
            :
            layoutParts.find(x => x.partProperties.partTypeId == props.drivingLayoutPartTypeId).partParameterList;


        //const partParameterResolutionItem = getPartParameterResolutionItem(props.assemblyLocationId, props.partData.partTypeId, props.data.parameterId);
        const initialValues = props.data.partParameterResolutionDictionary[assemblyLocation] ? props.data.partParameterResolutionDictionary[assemblyLocation] : {}
        return (
            <Formik
                initialValues={initialValues}

                onSubmit={(values) => {
                    //UpdateParameterResolution

                    values.drivingLayoutPartTypeId = parseInt(values.drivingLayoutPartTypeId, 10)
                    const putMethod = {
                        method: 'PUT', // Method itself
                        headers: {
                            'Content-type': 'application/json; charset=UTF-8' // Indicates the content 
                        },
                        body: JSON.stringify(values) // We send data in JSON format
                    }

                    fetch(`https://localhost:44312/partcatalog/${props.partData.partTypeId}/partparameter/${props.data.parameterId}/assemblylocation/${assemblyLocation}`, putMethod)
                        .then(updateParameter(props.partData.partTypeId, props.data.parameterId, assemblyLocation, values))
                        .catch(err => console.log(err))

                }

                }
            >
                {({
                    values,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting
                    /* and other goodies */
                }) => (
                    <form onSubmit={handleSubmit}>
                        <div style={{ float: "left", marginRight: "20px" }}>
                            <label htmlFor="resolutionType">Resolution Type Location</label>
                            <Field
                                as="select"
                                name="resolutionType"
                                value={values.resolutionType}
                            >
                                <option value="NORESOLUTION">NORESOLUTION</option>
                                {!props.partData.isLayoutPart &&
                                    <option value="SKETCH">SKETCH</option>
                                }
                                <option value="MAPPEDTOCONFIGPROP">MAPPEDTOCONFIGPROP</option>
                                <option value="LAMBDAFUNCTION">LAMBDAFUNCTION</option>
                                <option value="STATIC">STATIC</option>
                                <option value="NORESOLUTION">NORESOLUTION</option>
                                <option value="ASSEMBLYPARAMETER">ASSEMBLYPARAMETER</option>
                            </Field>
                        </div>
                        { values.resolutionType === "STATIC" &&
                            <div style={{ float: "left", marginRight: "20px" }}>
                                <label htmlFor="defaultStaticValue">Default Value</label>
                                <Field
                                    as="input"
                                    name="defaultStaticValue"
                                    value={values.defaultStaticValue}
                                />
                            </div>
                        }

                        { (values.resolutionType === "SKETCH") &&
                            <div style={{ float: "left", marginRight: "20px" }}>
                                <label htmlFor="drivingInputName">Driving Input</label>
                                {/* {layoutParts.find(x => x.partProperties.partTypeId == props.drivingLayoutPartTypeId) && */}
                                <Field
                                    as="select"
                                    name="drivingInputName"
                                    value={values.drivingInputName}
                                >

                                    <option value=""></option>
                                    {layoutSketchParameters.map((item) => <option value={item.name}>{item.name}</option>)}

                                </Field>
                                {/* } */}

                            </div>
                        }
                        { (values.resolutionType === "ASSEMBLYPARAMETER") &&
                            <div style={{ float: "left", marginRight: "20px" }}>
                                <label htmlFor="drivingInputName">Driving Input</label>
                                {/* {layoutParts.find(x => x.partProperties.partTypeId == props.drivingLayoutPartTypeId) && */}
                                <Field
                                    as="select"
                                    name="drivingInputName"
                                    value={values.drivingInputName}
                                >

                                    <option value=""></option>
                                    {containingAssemblyPart.partParameterList.map((item) => <option value={item.name}>{item.name}</option>)}

                                </Field>
                                {/* } */}

                            </div>
                        }


                        { (values.resolutionType === "LAMBDAFUNCTION") &&
                            <div style={{ float: "left", marginRight: "20px" }}>
                                <label htmlFor="resolutionType">Input Selector</label>
                                {/* TODO:  WHen swithcing between sketch and lambda this uses the parameter id.  Need to clear out or add seperate field */}
                                <Field
                                    as="input"
                                    name="drivingInputName"
                                    value={values.drivingInputName}
                                />
                            </div>
                        }

                        {/* TODO:  provide schema as a field */}
                        { (values.resolutionType === "MAPPEDTOCONFIGPROP") &&
                            <div style={{ float: "left", marginRight: "20px" }}>
                                <label htmlFor="resolutionType">Input Selector</label>
                                {/* TODO:  WHen swithcing between sketch and lambda this uses the parameter id.  Need to clear out or add seperate field */}
                                {/* TODO: Add selector so we can choose different config options for different levels of config object.  This will correspond with PartCatalogItem.DrivingConfigObjectSelector which is not yet used. */}

                                <Field
                                    as="select"
                                    name="drivingInputName"
                                    value={values.drivingInputName}
                                >

                                    <option value=""></option>
                                    {configProperties.map((item) => <option value={item}>{item}</option>)}

                                </Field>


                            </div>
                        }

                        { values.resolutionType === "LAMBDAFUNCTION" &&
                            <div style={{ float: "left", marginRight: "20px" }}>
                                <label htmlFor="resolutionType">Lambda Function</label>
                                <Field
                                    as="textarea"
                                    rows="7" cols="80"
                                    name="lambdaFunction"
                                    // onChange={handleChange}
                                    // onBlur={handleBlur}
                                    placeholder="function out(config, sketch, positionType) {return pos}"
                                    value={values.lambdaFunction}
                                />
                            </div>
                        }
                        <div style={{ float: "", marginRight: "20px" }}>
                            <label htmlFor="resolutionType">  </label>
                            <button type="submit" disabled={isSubmitting}>
                                Update
           </button>
                        </div>
                    </form>
                )}
            </Formik>
        )
    }


    return (
        <div>
            <DataTable
                striped={true}
                highlightOnHover={true}
                title="VIFAB Parts Service Catalog"
                columns={columns}
                data={assemblyParts}
                //onRowClicked={handleRowClick}
                //onRowExpandToggled={handleRowExpand}
                expandableRows
                expandableRowsComponent={<ExpandedAssemblyComponent />}

            />
            <Modal show={show} onHide={handleClose} dialogClassName="modal-dialog modal-lg">
                <Modal.Header closeButton>
                    <Modal.Title>Update {activePartData.partProperties.partName} Parameters</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!activePartData.partProperties.isAssembly &&
                        <ComponentPropertyForm selectedComponent={activePartData} />
                    }
                    <DataTable
                        title={`Part ${activePartData.partTypeId} Parameters at ${activeLocation}`}
                        striped={true}
                        highlightOnHover={true}
                        columns={parameterColumns}
                        data={activePartData.partParameterList}
                        expandableRows
                        expandableRowsComponent={<ParameterForm partData={activePartData.partProperties} drivingLayoutPartTypeId={activeDrivingLayoutPartTypeId} />}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                    {/* <Button type="submit" variant="primary" onClick={handleClose}>Save Changes</Button> */}
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default PartCatalogTable;