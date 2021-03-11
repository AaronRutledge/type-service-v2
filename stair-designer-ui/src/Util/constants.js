export const feetOrInches = 'In feet and/or inches.  Examples: 48", 4\' or 4\' 6 1/2"';
export const awsApiUrl = 'https://nx16rqcmgf.execute-api.us-west-2.amazonaws.com/dev/v1/stairwell';
export const sampleLevels = [
    {
        "id": 30,
        "levelName": "Bogus Level 1",
        "elevation": -15.333333333333334
    },
    {
        "id": 9946,
        "levelName": "Level 2",
        "elevation": -0.5
    },
    {
        "id": 370360,
        "levelName": "Level 3",
        "elevation": 14.875
    },
    {
        "id": 370404,
        "levelName": "Level 4",
        "elevation": 30.25
    },
    {
        "id": 370448,
        "levelName": "Level 5",
        "elevation": 45.541666666666664
    },
    {
        "id": 370691,
        "levelName": "Level 6",
        "elevation": 60.875
    }
];

export const samplePlanLevels =["Level 1","Level 2","Site","Level 3","Level 4","Level 5","Level 6"];

export const initialState =
{
    activeStair: {
        storiesDefinedBy: "import",
        currentStep: 0,
        drawerVisible: false,
        treadWidth: 11,
        stairwellWidthF: '110"',
        stairWidth: 48.5,
        isClockwise: true,
        minimumLandingWidth: 44,
        minimumRiserHeight: 6.95,
        // TODO: Fully implement.  This factor should be applied in the revit adn solidworks model to create a clearance around the stair.
        wallClearance: .5,
        defaultStoryHeight: "12'",
        storyCount: 3,
        stairwellLengthHandling: 'minimum',
        stairwellExcessLengthHandling: 'increaseStoryLandings',
        stairwellWidthHandling: 'minimum',
        landingElevationDelta: '0"',
        stories: [],
        flights: [],
        floorLevels: [],
        railingPanelType: 'horizontalPicket',
        exteriorRailType: 'handrail',
        interiorRailType: 'guardrail',
        maxFlightRise: '8\' 0"',
        landingsAtFloorLevels: true,
        stairEdgeOffset: 2
    },
    project:{
        stairwells: []
        
    }
};


export const railingOptions = [
    {
        key: "industrial",
        label: "Industrial"
    },
    {
        key: "horizontalPicket",
        label: "Horizontal Picket"
    },
    {
        key: "verticalPicket",
        label: "Vertical Picket"
    },
    {
        key: "meshRail",
        label: "Mesh Rail"
    },
    {
        key: "steelPanel",
        label: "Steel Panel"
    },
    {
        key: "none",
        label: "No guard railings"
    },
];

export const railLocationTypes = [
    {
        key: "handrail",
        label: "Wall mounted handrail"
    },
    {
        key: "guardrail",
        label: "Guardrail"
    },
    {
        key: "none",
        label: "none"
    }
];

export const landingSupportTypes = [
    {
        key: 'hangerRod',
        label: 'Hanger Rods'
    },
    {
        key: 'tubeColumns',
        label: 'Tube Columns'
    },
    {
        key: 'shelfAngle',
        label: 'Shelf Angle'
    },
    {
        key: 'framed',
        label: 'Connect to Framing'
    },
]

