//using LiteDB;
//using Newtonsoft.Json;
//using Newtonsoft.Json.Converters;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace PartParameterConsoleApp
//{
//    //I need to add all of these to a library project and share between the services...
//    //https://stackoverflow.com/questions/2666898/share-c-sharp-class-source-code-between-several-projects
//    //menawhile, this should be the golden source and then copied to api and resolver
//    public enum BillOfMaterialType
//    {
//        SAWCUT,
//        PLATEPLASMA,
//        TUBELASER,
//        FORMED,
//        BOUGHT,
//        SHOPASSEMBLED,
//        OMIT,
//        UNASSIGNED
//    }

//    public enum PartParameterType
//    {
//        MODEL,
//        REFERENCE,
//        USER
//    }

//    public enum ParameterResolutionType
//    {
//        SKETCH,
//        MAPPEDTOCONFIGPROP,
//        LAMBDAFUNCTION,
//        NORESOLUTION,
//        STATIC
//    }
//    public enum UnitType
//    {
//        IN,
//        DEG,
//        UL
//    }

//    public enum PositonType
//    {
//        FIXED,
//        PATTERNED
//    }
//    //static UnitType ResolveUnit(string unit)
//    //{
//    //    switch (unit)
//    //    {
//    //        case "in":
//    //            return UnitType.IN;
//    //        case "deg":
//    //            return UnitType.DEG;
//    //        case "ul":
//    //            return UnitType.UL;
//    //        default:
//    //            return UnitType.IN;
//    //    }
//    //}

//    class PartParameterItem
//    {
//        [BsonId]
//        public string ParameterId { get; set; }
//        public string Name { get; set; }
//        //Saving as string for db, but should be a UnitType
//        public string Units { get; set; }
//        public bool IsRequiredInput { get; set; }
//        public bool IsDrivenParameter { get; set; }
//        //Saving as a string for db, but should be a ParameterResolutionType
//        public string ResolutionType { get; set; }//non-derived field
//        public string DefaultStaticValue { get; set; }//non-derived field
//        //delete in favor of property at part level.  add to ui
//        public int DrivingLayoutPartTypeId { get; set; }//non-derived field
//        public string DrivingInputName { get; set; }//non-derived field.  Either input type for lambda or sketch parameter name
//        public string LambdaFunction { get; set; } ////non-derived field--will take part input parameters as input and will return value of parameter
//    }

//    class PartPropertiesItem
//    {
//        public int PartTypeId { get; set; }
//        public string PartName { get; set; }//always file name?
//        public bool? IsLayoutPart { get; set; }
//        //public int? ParentPartId { get; set; }
//        public bool IsAssembly { get; set; }
//        public string FilePath { get; set; }
//        public int DrivingLayoutPartTypeId { get; set; }

//    }
//    class AssemblyLocation
//    {
//        [BsonId]
//        public string LocationId { get; set; }
//        public string OccurrenceName { get; set; }
//        //Saving as a string fro db, but should be a PositonType
//        public string PositionType { get; set; }
//        public int PartTypeId { get; set; }
//        public string DrivingInputName { get; set; }//non-derived field.  Either input type for lambda or sketch parameter name
//        //non-derived field...
//        public string LambdaFunction { get; set; }
//        //public bool NeedsMapping { get; set; }
//    }

//    class PartCatalogItem
//    {
//        public List<PartParameterItem> PartParameterList { get; set; }
//        public PartPropertiesItem PartProperties { get; set; }
//        public List<AssemblyLocation> AssemblyLocationList { get; set; }
//        public bool NeedsMapping { get; set; }
//        [BsonId]
//        public int PartTypeId { get; set; }
//        public int? Version { get; set; }
//        [JsonConverter(typeof(StringEnumConverter))]
//        public BillOfMaterialType? BillOfMaterialType { get; set; }
//        public int? BillOfMaterialProcessingOrder { get; set; }
//    }
//}
