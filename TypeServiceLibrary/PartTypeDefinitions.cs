using LiteDB;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace TypeServiceLibrary
{
    public class PartTypeDefinitions
    {
        public enum BillOfMaterialType
        {
            SAWCUT,
            PLATEPLASMA,
            TUBELASER,
            FORMED,
            BOUGHT,
            SHOPASSEMBLED,
            OMIT,
            UNASSIGNED
        }

        public enum PartParameterType
        {
            MODEL,
            REFERENCE,
            USER
        }

        public enum ModelOutputType
        {
            DXF,
            STL,
            PDF,
            NONE
        }
        public enum ParameterResolutionType
        {
            SKETCH,
            MAPPEDTOCONFIGPROP,
            LAMBDAFUNCTION,
            NORESOLUTION,
            STATIC
        }
        public enum UnitType
        {
            IN,
            DEG,
            UL
        }

        public enum PositonType
        {
            FIXED,
            PATTERNED
        }
        //static UnitType ResolveUnit(string unit)
        //{
        //    switch (unit)
        //    {
        //        case "in":
        //            return UnitType.IN;
        //        case "deg":
        //            return UnitType.DEG;
        //        case "ul":
        //            return UnitType.UL;
        //        default:
        //            return UnitType.IN;
        //    }
        //}

        public class PartParameterItem
        {
            //Need to add if a global variable is required for selection.
            [BsonId]
            public string ParameterId { get; set; }
            public string Name { get; set; }
            //Saving as string for db, but should be a UnitType
            public string Units { get; set; }
            public bool IsRequiredInput { get; set; }
            public bool IsDrivenParameter { get; set; }

            //maps Assembly Location as key to PartParameterResolution
            public Dictionary<string, PartParameterResolutionItem> PartParameterResolutionDictionary { get; set; }
            //Saving as a string for db, but should be a ParameterResolutionType


            public class PartParameterResolutionItem
            {
                public string AssemblyLocationId { get; set; }
                public string ResolutionType { get; set; }//non-derived field
                public string DefaultStaticValue { get; set; }//non-derived field

                //public int DrivingLayoutPartTypeId { get; set; }//non-derived field
                public string DrivingInputName { get; set; }//non-derived field.  Either input type for lambda or sketch parameter name
                public string LambdaFunction { get; set; } ////non-derived field--will take part input parameters as input and will return value of parameter
                public string LocationType { get; set; } ////non-derived field--describes location of this location--for example left, right, top, bottom.   Importnat when multiple locations for the same type are present in a part
            }

        }

        public class PartPropertiesItem
        {
            public int PartTypeId { get; set; }
            public string PartName { get; set; }//always file name?
            public bool? IsLayoutPart { get; set; }
            //public int? ParentPartId { get; set; }
            public bool IsAssembly { get; set; }

            public int ConfigurationOrderPrecedence { get; set; }
            public string FilePath { get; set; }
            //should be enum of ModelOutputType 


        }
        public class AssemblyLocation
        {
            //Add 

            [BsonId]
            public string LocationId { get; set; }
            public string OccurrenceName { get; set; }
            //Saving as a string fro db, but should be a PositonType
            public string PositionType { get; set; }
            public int PartTypeId { get; set; }

            public bool IsLayout { get; set; }
            public string ResolutionType { get; set; }//non-derived field
            public string DefaultStaticValue { get; set; }//non-derived field

            //public int DrivingLayoutPartTypeId { get; set; }//non-derived field
            //public string DrivingInputName { get; set; }//non-derived field.  Either input type for lambda or sketch parameter name
            public string LambdaFunction { get; set; } ////non-derived field--will take part input parameters as input and will return value of parameter

            public string LocationType { get; set; } ////non-derived field--describes location of this location--for example left, right, top, bottom.   Importnat when multiple locations for the same type are present in a part


        }
        //this needs to be associated with a RESOLVED assembly.  This file is more about generic TYPES.  
        //You will need to add to part configuration instead.  However, you will also need added info here so tha the resolver servie resolves all required fields.
        

        public class PartCatalogItem
        {
            public List<PartParameterItem> PartParameterList { get; set; }
            public PartPropertiesItem PartProperties { get; set; }
            public List<AssemblyLocation> AssemblyLocationList { get; set; }
            public bool NeedsMapping { get; set; }

            //whethther this is the root component (for example, as stairwell)
            public bool IsRootAssembly { get; set; }
            [BsonId]
            public int PartTypeId { get; set; }
            public int? Version { get; set; }
            //Saving as a string for db, but should be a BillOfMaterialType
            public string BillOfMaterialType { get; set; }
            public string MaterialType { get; set; }
            public string ModelOutputType { get; set; }
            public int? BillOfMaterialProcessingOrder { get; set; }

            //This should only be associated with assemblies.  COnsider refactor of assembly specific properties
            public int? DrivingLayoutPartTypeId { get; set; }//non-derived field.
            public string DrivingConfigObjectSelector { get; set; }//TODO: implement.  Also usually only associated with assemblies.  
            public string DrivingConfigObjectType { get; set; }
            //Adding to ui.  Program will require that the configurator inputt to the component object is of this type.  Is flight for most components and base for stairwell.
            //Eventually this could be a dynamic selector
        }
    }
}
