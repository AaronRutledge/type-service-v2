using System;
using System.Collections.Generic;
using System.Text;

namespace TypeServiceLibrary
{
    public class FlightConfigurator
    {
        public class FlightConfiguration
        {
            [LiteDB.BsonId]
            public int StairNumber { get; set; }
            public List<FlightData> Flights { get; set; }
            public OverallStairData StairData { get; set; }
        }

        public class OverallStairData
        {
            public int ProjectId { get; set; }
            public string StairName { get; set; }

            public string Orientation { get; set; }
            public double BaseElevation { get; set; }
            public double BaseLandingWidthToWall { get; set; }
            public double StairEdgeClearance { get; set; }
            public double StairwellWidth { get; set; }
            public double StairwellLength { get; set; }
            public double StairWidth { get; set; }
        }

        public class FlightData
        {
            public int FlightNumber { get; set; }
            public string FlightName { get; set; }
            public double Elevation { get; set; }
            public double LandingWidth { get; set; }
            public bool IsTopDogLeg { get; set; }
            public double TopDogLegLength { get; set; }
            public double StairRise { get; set; }
            public double StairRun { get; set; }
            public int Risers { get; set; }
            public double RiserHeight { get; set; }

            public double StringerThickness { get; set; }
            public bool IsDdl { get; set; }
            public bool IsBridge { get; set; }
            public bool HasLandingRail { get; set; }
            public bool HasSafetyGate { get; set; }
            public bool LandingHasRightStandPipePenetration { get; set; }

            public bool LandingHasLeftStandPipePenetration { get; set; }
            public double calculatedLength { get; set; }
        }
    }
}
