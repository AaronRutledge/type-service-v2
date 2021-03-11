using LiteDB;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;
using System.Xml;
using static TypeServiceLibrary.PartTypeDefinitions;
using static TypeServiceLibrary.PartTypeDefinitions.PartParameterItem;

namespace PartParameterConsoleApp
{
    class TypeService
    {
        public static LiteDatabase Db;
        public static Inventor.Application invApp;
        public string DbPath = @"D:\Projects\VifabTypeService\Data\PartCatalogData.db";
        public TypeService()
        {
            //Inventor.Application invApp = null;
            //TODO: Might be nice to check if application is running and open and instance if it is not and then close when done.
            //https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.process.start?redirectedfrom=MSDN&view=netcore-3.1#overloads
            //This may fail if you run VS as an Administrator
            invApp = (Inventor.Application)Marshal.GetActiveObject("Inventor.Application");
            invApp.SilentOperation = true;

            //Master list of all parts we will be creating
            var partCatalog = new List<PartCatalogItem>();
            //var partsParameterDictionary = new Dictionary<string, List<PartParameterItem>>();
            Db = new LiteDatabase(DbPath);

            //Got a list to all ipt files in part path
            var partRoot = @"D:\VIFAB_Stair_System_CAD\CAD";


            var allParts = Directory.GetFiles(partRoot, "*.ipt", SearchOption.AllDirectories)
                .Where(item => (!item.Contains("OldVersions")))
                .ToList<string>();

            var allAssemblies = Directory.GetFiles(partRoot, "*.iam", SearchOption.AllDirectories)
                .Where(item => (!item.Contains("OldVersions")))
                .ToList<string>();

            allParts.ForEach(x => partCatalog.Add(GetPartProperties(x).Item2));
            ProcessAssemblies(allAssemblies, partCatalog);

            Db.Dispose();
        }

        static List<PartCatalogItem> ProcessAssemblies(List<string> assemblyList, List<PartCatalogItem> partCatalog)
        {
            List<string> reprocessList = new List<string>();
            foreach (var assemblyItem in assemblyList)
            {
                var partProperties = GetPartProperties(assemblyItem);
                if (partProperties.Item1)
                {
                    var partPropertiesItem = partProperties.Item2;
                    partCatalog.Add(partPropertiesItem);
                }
                //stick assembly at end of list
                else
                {
                    reprocessList.Add(assemblyItem);
                }

            }
            if (reprocessList.Count > 0) ProcessAssemblies(reprocessList, partCatalog);
            return partCatalog;
        }




        static string ReturnOrSetCustomProperty(Inventor.Document Doc, string PropertyName, string PropertyJson = null)
        {
            // Get the custom property set. 
            Inventor.PropertySet customPropSet;
            customPropSet = Doc.PropertySets["Inventor User Defined Properties"];

            // Get the existing property, if it exists.
            Inventor.Property prop = null;
            bool propExists = true;
            try
            {
                prop = customPropSet[PropertyName];
            }
            catch
            {
                propExists = false;
            }


            // Check to see if the property was successfully obtained.
            if (!propExists)
            {
                if (PropertyJson != null)
                {
                    customPropSet.Add(PropertyJson, PropertyName, null);
                    Doc.Save();
                }
                // Failed to get the existing property so create a new one.
                //

                return "";
            }
            else
            {
                if (PropertyJson != null)
                {
                    prop.Value = PropertyJson;
                    Doc.Save();
                }
                //return prop.Value;
                return new JavaScriptSerializer().Serialize(prop.Value);
            }
        }


        static Tuple<bool, List<AssemblyLocation>> GetAssemblyComponents(Inventor.AssemblyDocument assemblyDoc, PartCatalogItem itemFromDb)
        {

            var assemblyOccurence = assemblyDoc.ComponentDefinition.Occurrences;

            var assemblyLocationList = new List<AssemblyLocation>();
            //If success is false, the assembly has assemblies that need to be processed and it will be moved down the list.
            //bool success = false;
            AssemblyLocation locationItemFromDb = new AssemblyLocation();
            foreach (var item in assemblyOccurence)
            {
                var occurence = (Inventor.ComponentOccurrence)item;
                bool hasVifabId = false;
                string locationId = "";


                //check if occurence has a vifab attribute set
                try
                {
                    var vifabAttribute = occurence.AttributeSets["vifab"]["occurenceId"].Value;
                    hasVifabId = true;
                    locationId = vifabAttribute.ToString();

                    if (itemFromDb != null) locationItemFromDb = itemFromDb.AssemblyLocationList.FirstOrDefault<AssemblyLocation>(y => y.LocationId == locationId);

                }
                catch
                //this block executed if there is not an existing attribute set
                {
                    //This is if the db has been cleared but the part retains a vifab attribute
                    if (hasVifabId != true)
                    {
                        locationId = Guid.NewGuid().ToString();
                        var vifabAttribute = occurence.AttributeSets.Add("vifab");
                        vifabAttribute.Add("occurenceId", Inventor.ValueTypeEnum.kStringType, locationId);
                        assemblyDoc.Save();
                    }

                }

                var occurenceDoc = (Inventor.Document)occurence.Definition.Document;

                var partPropertyString = ReturnOrSetCustomProperty(occurenceDoc, "VIFAB").Replace(@"\", "");
                PartPropertiesItem partProperties;
                try
                {
                    partProperties = JsonConvert.DeserializeObject<PartPropertiesItem>(partPropertyString.Substring(1, partPropertyString.Length - 2));
                }
                catch
                {
                    return new Tuple<bool, List<AssemblyLocation>>(false, assemblyLocationList);
                }


                if (!(occurence.IsPatternElement && occurence.PatternElement.Index > 1))//skip if this part of a pattern and is not the first element
                {

                    var assemblyLocationItem = new AssemblyLocation()
                    {
                        PartTypeId = partProperties.PartTypeId,
                        OccurrenceName = occurence.Name,
                        PositionType = occurence.IsPatternElement ? "PATTERNED" : "FIXED",
                        LocationId = locationId,
                        IsLayout = occurenceDoc.FullDocumentName.ToLower().Contains("layout"),



                    };
                    if (hasVifabId && locationItemFromDb != null)
                    {
                        assemblyLocationItem.LambdaFunction = locationItemFromDb.LambdaFunction;
                        assemblyLocationItem.LocationType = locationItemFromDb.LocationType;
                        assemblyLocationItem.ResolutionType = locationItemFromDb.ResolutionType;

                    }
                    assemblyLocationList.Add(assemblyLocationItem);
                }

            }
            return new Tuple<bool, List<AssemblyLocation>>(true, assemblyLocationList);

        }


        static Tuple<bool, PartCatalogItem> GetPartProperties(string file)
        {
            var isAssembly = Path.GetExtension(file).Contains(".iam");
            invApp.Documents.Open(file);
            Inventor.PartDocument partDoc;
            Inventor.AssemblyDocument assemblyDoc;
            Inventor.Parameters partParams;
            var itemFromPart = new PartCatalogItem() { };
            string partPropertyString;
            partPropertyString = ReturnOrSetCustomProperty(invApp.ActiveDocument, "VIFAB").Replace(@"\", "");
            bool isNewPart = !(partPropertyString.Length > 2);//we will create
            //TODO:  We should just save off VIFAB attribute with an id and then restore all data from database.  This is all ripe for refactor.
            if (!isNewPart)
            {
                //itemFromPart.PartProperties = new PartPropertiesItem;
                itemFromPart.PartTypeId = JsonConvert.DeserializeObject<PartPropertiesItem>(partPropertyString.Substring(1, partPropertyString.Length - 2)).PartTypeId;
                //itemFromPart.DrivingLayoutPartTypeId = null;
            }
            else
            {
                itemFromPart.PartProperties = new PartPropertiesItem();
            }
            bool updatePartInDb = false;//we will updated database record

            var itemFromDb = new PartCatalogItem();
            if (itemFromPart.PartTypeId != 0)
            {

                var col = Db.GetCollection<PartCatalogItem>("PartCatalog");
                itemFromDb = col.Query()
                    .Where(y => y.PartTypeId == itemFromPart.PartTypeId).FirstOrDefault();
                if (itemFromDb != null)
                {
                    itemFromPart.PartProperties = itemFromDb.PartProperties;

                    itemFromPart.BillOfMaterialType = itemFromDb.BillOfMaterialType;
                    itemFromPart.DrivingLayoutPartTypeId = itemFromDb.DrivingLayoutPartTypeId;
                    itemFromPart.DrivingConfigObjectSelector = itemFromDb.DrivingConfigObjectSelector;
                    itemFromPart.IsRootAssembly = itemFromDb.IsRootAssembly;
                    itemFromPart.DrivingConfigObjectType = itemFromDb.DrivingConfigObjectType;
                }
                else
                {
                    isNewPart = true;
                }

            }

            if (isAssembly)
            {
                assemblyDoc = (Inventor.AssemblyDocument)invApp.ActiveDocument;
                partParams = assemblyDoc.ComponentDefinition.Parameters;

                var assemblyLocationList = GetAssemblyComponents(assemblyDoc, itemFromDb);
                if (assemblyLocationList.Item1)
                {
                    itemFromPart.AssemblyLocationList = GetAssemblyComponents(assemblyDoc, itemFromDb).Item2;
                }
                else
                {
                    Console.WriteLine("Assembly of assembly not configured.  Putting it at the back of the line...");
                    return new Tuple<bool, PartCatalogItem>(false, itemFromPart);
                }
                itemFromPart.DrivingLayoutPartTypeId = itemFromPart.AssemblyLocationList.Find(x => x.IsLayout = true).PartTypeId;
            }
            else
            {
                partDoc = (Inventor.PartDocument)invApp.ActiveDocument;
                partParams = partDoc.ComponentDefinition.Parameters;
            }

            var partParameterList = new List<PartParameterItem>();

            //for each parameter, check if has a vifab tag in the comments section of the parameter.
            //if it does lookup in the database.  make sure name is the same.  if it isn't update database.  no further action needed
            //if it doesn't exist in db, add default record

            foreach (Inventor.Parameter item in partParams)
            {
                if (item.Type == Inventor.ObjectTypeEnum.kUserParameterObject)
                {
                    var tryAndUseExistingParameter = (!isNewPart && item.Comment.ToLower().Contains("<vifab>"));
                    var notFoundInDb = false;
                    //TODO:  If these have been removed from the database we should recreate.  Right now it will just skip over them.
                    if (tryAndUseExistingParameter)
                    {
                        var parameterId = "";

                        //use regex to get vifab and everything in between...
                        Regex regex = new Regex(@"<vifab>[\s\S]*?<\/vifab>");
                        Match match = regex.Match(item.Comment.ToLower());
                        if (match.Success)
                        {
                            XmlDocument doc = new XmlDocument();
                            doc.LoadXml(match.Value);
                            XmlNode xn = doc.SelectSingleNode("//vifab");
                            parameterId = xn.InnerText;
                        }

                        PartParameterItem parameterItem = new PartParameterItem();
                        //if database is blank this will fail.  TODO:  Possibly throw an excpetion or reinitialize db field.  This is an edge case.
                        if (itemFromDb != null)
                        {
                            parameterItem = itemFromDb.PartParameterList.FirstOrDefault<PartParameterItem>(y => y.ParameterId == parameterId);

                        }

                        //var recordCount = results.Count();

                        //TODO:  This needs cleaned up.  Assume you will always either update or create.  If it is update, just reassign values from databse to constructed parameter object

                        //if we have a result, lets compare it to make sure the name hasn't changed and then add it to newItem
                        if (parameterItem != null)
                        {
                            if (parameterItem.Name != item.Name || parameterItem.IsRequiredInput != item.IsKey)
                            {
                                //name and key flag in part override database
                                updatePartInDb = true;
                                parameterItem.Name = item.Name;
                                parameterItem.IsRequiredInput = item.IsKey;
                            }
                            partParameterList.Add(parameterItem);
                        }
                        else

                        {
                            notFoundInDb = true;

                        }

                    }
                    // else if(!tryAndUseExistingParameter || notFoundInDb)
                    if (!tryAndUseExistingParameter || notFoundInDb)
                    // Item is not tagged and is a new parameter (for either a new part or an existing part).
                    {
                        var partParmeters = new PartParameterItem()
                        {
                            ParameterId = Guid.NewGuid().ToString(),
                            Name = item.Name,
                            Units = item.get_Units(),
                            IsRequiredInput = item.IsKey,
                            PartParameterResolutionDictionary = new Dictionary<string, PartParameterResolutionItem>()
                            //ResolutionType = ParameterResolutionType.NORESOLUTION.ToString(),

                        };
                        partParameterList.Add(partParmeters);
                        //if it is not a new part, but does not have a vifab tag, it is a new parameter and should be added to database
                        if (!isNewPart) updatePartInDb = true;
                        //update the parameter comment with new tag
                        item.Comment = "<vifab>" + partParmeters.ParameterId + "</vifab>";
                        invApp.ActiveDocument.Save();
                    }
                }
            }

            //TODO: we should now compare the database locations to see if any are no longer present in part and should be deleted.  
            //An update is all that needs to be called since it ownt be in the parameter list

            if (itemFromDb != null && itemFromDb.PartParameterList != null)
            {
                foreach (var item in itemFromDb.PartParameterList)
                {
                    bool has = partParameterList.Any(param => param.ParameterId == item.ParameterId);
                    if (!has) updatePartInDb = true;
                }
            }

            itemFromPart.PartParameterList = partParameterList;

            //PartPropertiesItem partProperties;

            updatePartInDb = true;//TODO:  this overrides calcualted value.  Rermove and implement





            //if (itemFromPart.PartProperties.IsAssembly) itemFromPart.DrivingLayoutPartTypeId = itemFromPart.AssemblyLocationList.Find(x => x.IsLayout = true).PartTypeId;

            if (isNewPart)
            {
                itemFromPart.Version = 1;
                itemFromPart.BillOfMaterialType = "UNASSIGNED";

                var partProperties = new PartPropertiesItem()
                {
                    FilePath = file,
                    PartName = Path.GetFileNameWithoutExtension(file),
                    IsAssembly = isAssembly,
                    IsLayoutPart = Path.GetDirectoryName(file).ToLower().Contains("layout")
                };
                itemFromPart.PartProperties = partProperties;
                //Create database record and return id


                itemFromPart.NeedsMapping = true;
                partProperties.PartTypeId = AddPartToCatalog(itemFromPart);
                ReturnOrSetCustomProperty(invApp.ActiveDocument, "VIFAB", JsonConvert.SerializeObject(partProperties));
            }
            else if (updatePartInDb)//can just alwasys update too..
            {
                itemFromPart.PartProperties.FilePath = file;
                itemFromPart.PartProperties.PartName = Path.GetFileNameWithoutExtension(file);
                var col = Db.GetCollection<PartCatalogItem>("PartCatalog");
                var partToUpdate = col.Query()
                    .Where(y => y.PartTypeId == itemFromPart.PartTypeId).FirstOrDefault();
                partToUpdate = itemFromPart;
                col.Update(partToUpdate);
            }

            invApp.Documents.CloseAll();
            return new Tuple<bool, PartCatalogItem>(true, itemFromPart);
        }
        static int AddPartToCatalog(PartCatalogItem item)
        {
            // Get a collection (or create, if doesn't exist)
            var col = Db.GetCollection<PartCatalogItem>("PartCatalog");
            col.Insert(item);
            Db.Commit();
            item.PartProperties.PartTypeId = item.PartTypeId;
            col.Update(item);
            Db.Commit();
            return item.PartTypeId;
        }

    }
}
