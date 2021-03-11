using System;
using System.Collections.Generic;
using System.Text;

namespace TypeServiceLibrary
{
    public class PartTypeConfigurations
    {
        public int PartType { get; set; }

        public bool IsAssembly { get; set; }
        public int ConfigurationOrderPrecedence { get; set; }
        public Dictionary<int, PartNumberConfiguration> PartNumberConfigurations { get; set; }

        public PartTypeConfigurations(int partType, bool isAssembly = false, int configurationOrderPrecedence = 0)
        {
            PartType = partType;
            IsAssembly = isAssembly;
            ConfigurationOrderPrecedence = configurationOrderPrecedence;
            PartNumberConfigurations = new Dictionary<int, PartNumberConfiguration>();
        }

        public bool AddPartNumberConfiguration(int partNumber, Dictionary<string, string> configurationDictionary, Dictionary<string, AssemblyLocationConfiguration> partNoAssemblyLocationConfigurations=null)
        {
            if (PartNumberConfigurations.ContainsKey(partNumber))
            {
                return false;
            }
            else
            {
                PartNumberConfigurations.Add(
                    partNumber, 
                    new PartNumberConfiguration() { 
                        ConfigurationDictionary = configurationDictionary, 
                        PartNumber = partNumber ,
                        PartNoAssemblyLocationConfigurations= partNoAssemblyLocationConfigurations
                    });
                return true;
            }
        } 
    }

    public class PartNumberConfiguration
    {
       public int PartNumber { get; set; }
       public Dictionary<string, string> ConfigurationDictionary { get; set; }
       public Dictionary<string, AssemblyLocationConfiguration> PartNoAssemblyLocationConfigurations { get; set; }
       public BillOfMaterialItem BillOfMaterialItem { get; set; }
    }


    public class AssemblyLocationConfiguration
    {
        public bool IsPatterned { get; set; }
        public string LocationId { get; set; }
        public int PartNumber { get; set; }
        public bool Delete { get; set; }
        public string Distance { get; set; }
        public string PositionType { get; set; }

        //new param.  This is to assiste with BOM generation.  1 unless the item is patterned.
        public int Quantity { get; set; }

        //This should likely be an enum of type LocationType
        public string LocationType { get; set; }
    }


    //Associated with an assembly or dynamically generated (API) or likely combination
    public class ManufacturingReport
    {
        public Dictionary<string, string> ReportValueParametersDictionary { get; set; }

        public string AssemblyName { get; set; }
        public int PartNumber { get; set; }
        public int PartTypeId { get; set; }

        //Items below will need to be agregated 

        //tuple of quantity and the bill of material item
        public List<Tuple<int, BillOfMaterialItem>> BillOfMaterialList { get; set; }
        public Dictionary<string, string> LocationIdsDictionary { get; set; }
    }

    // Associated with a resolved PART
    public class BillOfMaterialItem
    {
        public string BillOfMaterialType { get; set; }
        public int PartTypeId { get; set; }

        public int PartNumber { get; set; }
        public string PartDescription { get; set; }
        public CutListItem CutListDetails { get; set; }
        public string PartModelFileLocation { get; set; }

    }
    public class CutListItem
    {
        //TODO:  Possibly make enum.  You will want to group by this
        public string Material { get; set; }
        public double CutLength { get; set; }
        public double AngleOne { get; set; }
        public double AngleTwo { get; set; }

    }


}
