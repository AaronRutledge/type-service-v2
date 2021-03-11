using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace TypeServiceLibrary
{
    public class StairConfigurator
    {

        public class Project
        {
            [JsonProperty("id")]
            public int Id { get; set; }
            [JsonProperty("projectGuid")]
            public Guid ProjectGuid { get; set; }
            [JsonProperty("projectName")]
            public string ProjectName { get; set; }
            [JsonProperty("stairwells")]
            public List<Stairwell> Stairwells { get; set; }

            public int AddStairwell(Stairwell stairwell)
            {
                Stairwells = Stairwells ?? new List<Stairwell>();
                stairwell.Id = Stairwells.Count + 1;
                Stairwells.Add(stairwell);
                return stairwell.Id;
            }

        }
        public class FloorLevel
        {
            [JsonProperty("id")]
            public int Id { get; set; }
            [JsonProperty("levelName")]
            public string LevelName { get; set; }
            [JsonProperty("elevation")]
            public double Elevation { get; set; }
            [JsonProperty("projectElevation")]
            public double ProjectElevation { get; set; }
        }

        public class Stairwell
        {
            [JsonProperty("id")]
            public int Id { get; set; }
            [JsonProperty("assemblyId")]
            public int AssemblyId { get; set; }
            [JsonProperty("stairName")]
            public string StairName { get; set; }
            [JsonProperty("isClockwise")]
            public bool IsClockwise { get; set; }
            [JsonProperty("project")]
            public Project Project { get; set; }
            [JsonProperty("currentStep")]
            public int CurrentStep { get; set; }
            [JsonProperty("treadWidth")]
            public double TreadWidth { get; set; }
            [JsonProperty("stairWidth")]
            public string StairWidth { get; set; }

            [JsonProperty("stairLength")]
            public double StairLength { get; set; }
            [JsonProperty("stairwellWidth")]
            public double StairwellWidth { get; set; }
            [JsonProperty("stairwellWidthF")]
            public string StairwellWidthF { get; set; }
            //[JsonProperty("stairwellLength")]
            //public string StairwellLength { get; set; }

            [JsonProperty("predeterminedStairwellLength")]
            public string PredeterminedStairwellLength { get; set; }
            [JsonProperty("minimumRiserHeight")]
            public string MinimumRiserHeight { get; set; }
            // TODO:  Should be enums
            [JsonProperty("railingType")]
            public string RailingType { get; set; }
            [JsonProperty("exteriorRailType")]
            public string ExteriorRailType { get; set; }
            [JsonProperty("interiorRailType")]
            public string InteriorRailType { get; set; }
            [JsonProperty("stairwellLengthHandling")]
            public string StairwellLengthHandling { get; set; }
            [JsonProperty("stairwellWidthHandling")]
            public string StairwellWidthHandling { get; set; }
            // not yet used
            //[JsonProperty("stairwellExcessWidthHandling")]
            //public string StairwellExcessWidthHandling { get; set; }
            [JsonProperty("stairwellExcessLengthHandling")]
            public string StairwellExcessLengthHandling { get; set; }
            [JsonProperty("landingsAtFloorLevels")]
            public string LandingsAtFloorLevels { get; set; }

            [JsonProperty("floorLevelLandingSupportType")]
            public string FloorLevelLandingSupportType { get; set; }

            [JsonProperty("intermediateLandingSupportType")]
            public string IntermediateLandingSupportType { get; set; }

            [JsonProperty("landingElevationDelta")]
            public string LandingElevationDelta { get; set; }

            [JsonProperty("minimumLandingWidth")]
            public double MinimumLandingWidth { get; set; }
            [JsonProperty("stairEdgeOffset")]
            public double StairEdgeOffset { get; set; }
            [JsonProperty("maxFlightRise")]
            public string MaxFlightRise { get; set; }
            [JsonProperty("bottomLevelId")]
            public int BottomLevelId { get; set; }
            [JsonProperty("topLevelId")]
            public int TopLevelId { get; set; }
            [JsonProperty("landingsLevels")]
            public List<int> LandingsLevels { get; set; }
            [JsonProperty("defaultStoryHeight")]
            public string DefaultStoryHeight { get; set; }
            [JsonProperty("stories")]
            public List<StairStory> Stories { get; set; }
            [JsonProperty("floorLevels")]
            public List<FloorLevel> FloorLevels { get; set; }
            [JsonProperty("planLevels")]
            public List<string> PlanLevels { get; set; }
            [JsonProperty("planLevel")]
            public string PlanLevel { get; set; }
            [JsonProperty("flights")]
            public List<StairFlight> Flights { get; set; }
            [JsonProperty("location")]
            public PlacedLocation Location { get; set; }
            [JsonProperty("boundingBox")]
            public BoundingBox BoundingBox { get; set; }
        }
        public class PlacedLocation
        {
            [JsonProperty("x")]
            public double X { get; set; }
            [JsonProperty("y")]
            public double Y { get; set; }
            [JsonProperty("z")]
            public double Z { get; set; }
            [JsonProperty("rotation")]
            public double Rotation { get; set; }
        }
        public class BoundingBox
        {
            [JsonProperty("minX")]
            public double MinX { get; set; }
            [JsonProperty("minY")]
            public double MinY { get; set; }
            [JsonProperty("minZ")]
            public double MinZ { get; set; }
            [JsonProperty("maxX")]
            public double MaxX { get; set; }
            [JsonProperty("maxY")]
            public double MaxY { get; set; }
            [JsonProperty("maxZ")]
            public double MaxZ { get; set; }
        }
        public class StairStory
        {
            [JsonProperty("storyId")]
            public int StoryId { get; set; }
            [JsonProperty("storyName")]
            public string StoryName { get; set; }
            [JsonProperty("elevation")]
            public string Elevation { get; set; }
            [JsonProperty("flights")]
            public int Flights { get; set; }
            [JsonProperty("isFloorLevelDriven")]
            public bool IsFloorLevelDriven { get; set; }
            [JsonProperty("associatedFloorLevelId")]
            public double? AssociatedFloorLevelId { get; set; }
            [JsonProperty("verticalOffsetFromFloorLevel")]
            public double? VerticalOffsetFromFloorLevel { get; set; }
            [JsonProperty("landingElevationDelta")]
            public string LandingElevationDelta { get; set; }
        }
        public class StairFlight
        {
            [JsonProperty("flightId")]
            public int FlightId { get; set; }
            [JsonProperty("story")]
            public int Story { get; set; }
            [JsonProperty("name")]
            public string Name { get; set; }
            [JsonProperty("topElevation")]
            public double TopElevation { get; set; }
            [JsonProperty("bottomElevation")]
            public double BottomElevation { get; set; }
            [JsonProperty("isClockwise")]
            public bool IsClockwise { get; set; }
            [JsonProperty("risers")]
            public int Risers { get; set; }
            [JsonProperty("riserHeight")]
            public double RiserHeight { get; set; }
            [JsonProperty("riseHeight")]
            public double RiseHeight { get; set; }
            [JsonProperty("runLength")]
            public double RunLength { get; set; }
            [JsonProperty("isBottomStair")]
            public bool IsBottomStair { get; set; }

            [JsonProperty("isDdl")]
            public bool IsDdl { get; set; }
            [JsonProperty("isTopStair")]
            public bool IsTopStair { get; set; }
            [JsonProperty("isDogLeg")]
            public bool IsDogLeg { get; set; }
            [JsonProperty("dogLegLength")]
            public double DogLegLength { get; set; }
            [JsonProperty("stringerThickness")]
            public double StringerThickness { get; set; }

            [JsonProperty("landingWidth")]
            public double LandingWidth { get; set; }
            [JsonProperty("landingLength")]
            public double LandingLength { get; set; }
            [JsonProperty("stairEdgeOffset")]
            public double StairEdgeOffset { get; set; }
            [JsonProperty("hasLanding")]
            public bool HasLanding { get; set; }

            [JsonProperty("hasSafetyGate")]
            public bool HasSafetyGate { get; set; }
            // TODO:  Make enum
            [JsonProperty("landingSupportType")]
            public string LandingSupportType { get; set; }
            [JsonProperty("landingElevationDelta")]
            public double LandingElevationDelta { get; set; }

            [JsonProperty("landingHasRightStandPipePenetration")]
            public bool LandingHasRightStandPipePenetration { get; set; }

            [JsonProperty("landingHasLeftStandPipePenetration")]
            public bool LandingHasLeftStandPipePenetration { get; set; }

            [JsonProperty("stairWidth")]
            public double StairWidth { get; set; }
            [JsonProperty("exteriorRailType")]
            public string ExteriorRailType { get; set; }
            [JsonProperty("interiorRailType")]
            public string InteriorRailType { get; set; }
            [JsonProperty("railingPanelType")]
            public RailingPanelTypes RailingPanelType { get; set; }
            [JsonProperty("isBridge")]
            public bool IsBridge { get; set; }
            [JsonProperty("hasLandingRail")]
            public bool HasLandingRail { get; set; }
        }

        public enum RailingPanelTypes
        {
            [JsonProperty("industrial")]
            Industrial = 0,
            [JsonProperty("horizontalPicket")]
            HorizontalPicket = 1,
            [JsonProperty("meshRail")]
            MeshRail = 2,
            [JsonProperty("verticalPicket")]
            VerticalPicket = 3,
            [JsonProperty("steelPanel")]
            SteelPanel = 4,
            [JsonProperty("none")]
            None = 5

        }
    }
}
