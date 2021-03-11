using LiteDB;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using TypeServiceLibrary;
using static TypeServiceLibrary.PartTypeDefinitions;

namespace InventorModelingService
{
    class Program
    {
        public static Dictionary<int, PartTypeConfigurations> PartTypeConfigurationDictionary;
        public static LiteDatabase Db;
        public static Inventor.Application InvApp;
        public static string CadSourceFolder;
        public static string CadDestinationFolder = "";
        public static Dictionary<int, string> PartFileLocations;

        static void Main(string[] args)
  
        {
            //This may fail if you run VS as an Administrator
            InvApp = (Inventor.Application)Marshal.GetActiveObject("Inventor.Application");
            InvApp.SilentOperation = true;

            var configFiles = Directory.GetFiles(@"D:\Projects\VifabTypeService\Data\ModelConfigs");
            CadSourceFolder = @"D:\VIFAB_Stair_System_CAD\CAD";
            foreach (var filePath in configFiles)
            {

                Db = new LiteDatabase(@"D:\Projects\VifabTypeService\Data\PartCatalogData.db");



                PartTypeConfigurationDictionary = JsonConvert
                    .DeserializeObject<Dictionary<int, PartTypeConfigurations>>(File.ReadAllText(filePath));
                var stairName = Path.GetFileNameWithoutExtension(filePath);
                Console.WriteLine("Starting " + stairName);

                //var stairName = "Stair 1";

                CadDestinationFolder = @"D:\Projects\VifabTypeService\Data\ModelOutput\" + stairName;
                //var diSource = new DirectoryInfo(CadDestinationFolder);
                //var diTarget = new DirectoryInfo(@"D:\Projects\VifabTypeService\Data\ModelOutput\" + stairName);
                //CopyAll(diSource, diTarget);
                PartFileLocations = new Dictionary<int, string>();

                var allPartConfigurationsList = PartTypeConfigurationDictionary.Values.ToList().Where(x => x.IsAssembly != true);
                var allAssemblyConfigurationsList = PartTypeConfigurationDictionary.Values.ToList().Where(x => x.IsAssembly == true);

                foreach (var item in allPartConfigurationsList)
                {
                    GeneratePart(item);
                }
                ProcessAssemblies(allAssemblyConfigurationsList);
                Db.Dispose();
                Console.WriteLine("Completed " + stairName);
            }

            Console.WriteLine("Modeling service successfully completed.  Press any key to close.");
            Console.ReadKey();
        }

        static void ProcessAssemblies(IEnumerable<PartTypeConfigurations> assemblyList)
        {
            List<PartTypeConfigurations> reprocessList = new List<PartTypeConfigurations>();
            foreach (var assemblyItem in assemblyList)
            {
                var partProperties = GeneratePart(assemblyItem);
                if (!partProperties)
                {
                    reprocessList.Add(assemblyItem);
                }

            }
            if (reprocessList.Count > 0) ProcessAssemblies(reprocessList);
        }

        //Not implemeted.  Moving BOM service to its own utility
        //Had difficulty with getting a specifiv BOMView below.
        //static void GenerateReportData()
        //{
        //    Inventor.AssemblyDocument assemblyDoc;
        //    assemblyDoc = (Inventor.AssemblyDocument)Program.InvApp.ActiveDocument;
        //    var bom = assemblyDoc.ComponentDefinition.BOM;
        //    bom.StructuredViewFirstLevelOnly = false;
        //    bom.PartsOnlyViewEnabled = false;
        //    var bomView = bom.BOMViews["Structured"];
        //    foreach(var item in bomView.BOMRows)
        //    {
        //        var test = item;
                
        //    }
        //}


        static bool ConfigureAssemblyWithConfiguredParts(PartTypeConfigurations configurationItem, string filePath)
        {

            foreach (var configuration in configurationItem.PartNumberConfigurations)
            {
                Program.InvApp.Documents.Open(filePath);
                Inventor.AssemblyDocument assemblyDoc;
                assemblyDoc = (Inventor.AssemblyDocument)Program.InvApp.ActiveDocument;

                var compDefinition = assemblyDoc.ComponentDefinition;
                var compOccurences = compDefinition.Occurrences;
                var fileSavePath = filePath.Replace(CadSourceFolder, CadDestinationFolder);
                var partNumberFileName = Path.GetDirectoryName(fileSavePath) + @"\" + configurationItem.PartType + "-" + configuration.Key.ToString() + ".iam";



                //Configure params...
                //this is redundant to the configuration of parts, but has to use an assmebly doc.  Must be a better way to cast it and consolidate these methods.
                var partParams = assemblyDoc.ComponentDefinition.Parameters.UserParameters;
                var configValue = configuration.Value;
                if (configValue.ConfigurationDictionary != null)
                {
                    foreach (var configParam in configValue.ConfigurationDictionary)
                    {
                        partParams[configParam.Key].Expression = configParam.Value;
                    }
                }
                assemblyDoc.Update();

                //end config params

                foreach (Inventor.ComponentOccurrence item in compOccurences)
                {
                    // var col = Program.Db.GetCollection<PartTypeDefinitions.PartCatalogItem>("PartCatalog");
                    string attributeValue = "";
                    try
                    {
                        attributeValue = item.AttributeSets["vifab"]["occurenceId"].Value.ToString();
                    }
                    catch
                    {
                        //var occurName = item.Name;

                        Console.WriteLine("occurence not found");
                    }
                    AssemblyLocationConfiguration assemblyLocation;
                    if (configuration.Value.PartNoAssemblyLocationConfigurations.TryGetValue(attributeValue, out assemblyLocation))
                    {
                        string replacementPartFileLocation;

                        if (assemblyLocation.Delete)
                        {
                            if (item.IsPatternElement)
                            {

                                Inventor.OccurrencePattern itemParent = (Inventor.OccurrencePattern)item.PatternElement.Parent;
                                itemParent.Delete();
                                item.Delete();
                                // Inventor.ComponentOccurrence itemOcc = (Inventor.ComponentOccurrence)item.PatternElement.Parent;
                                //itemOcc.Delete();
                            }
                            try
                            {
                                item.Delete();
                            }
                            catch
                            {
                                Console.WriteLine("Error deleting occurence");
                            }

                        }
                        else
                        {
                            //TODO: Looks like if you delete a location (on purpose) it returns false here and it gets stuck in a loop.  Fix!
                            if (PartFileLocations.TryGetValue(assemblyLocation.PartNumber, out replacementPartFileLocation))
                            {

                                item.Replace(replacementPartFileLocation, false);
                                //item.Name = assemblyLocation.PartNumber.ToString();

                            }
                            else
                            {
                                //assembly of assembly not configure...put to back of line
                                return false;
                            }
                        }
                    }

                }

                if (!PartFileLocations.ContainsKey(configuration.Key))
                {
                    PartFileLocations.Add(configuration.Key, partNumberFileName);
                    assemblyDoc.SaveAs(partNumberFileName, false);
                }

                
                assemblyDoc.Close(true);


                //var partNumberFileName = Path.GetDirectoryName(CadDestinationFolder) + @"\" + configurationItem.PartType + "-" + configuration.Key.ToString() + ".iam";
                //assemblyDoc.SaveAs(partNumberFileName, false);
                //assemblyDoc.Close();
            }

            return true;

        }
        //static void GetAssyLevelItemToDelete(Inventor.ComponentOccurrence oOcc)
        //{
        //    if(oOcc.IsPatternElement)
        //    {
        //        oOcc = oOcc.PatternElement.Parent;

        //    }

        //}

        static bool GeneratePart(PartTypeConfigurations partTypeConfiguration)
        {
            var col = Program.Db.GetCollection<PartTypeDefinitions.PartCatalogItem>("PartCatalog");
            var item = partTypeConfiguration;

            var partCatalogItem = col.Query()
                .Where(y => y.PartTypeId == item.PartType).FirstOrDefault();

            var filePath = partCatalogItem.PartProperties.FilePath;
            //var filePath = partCatalogItem.PartProperties.FilePath.Replace(CadSourceFolder, CadDestinationFolder);

            if (item.IsAssembly)
            {

                var configuredOk = ConfigureAssemblyWithConfiguredParts(item, filePath);
                if (!configuredOk)
                {
                    Console.WriteLine("Assembly of assembly not configured, placing at back of line...");
                    return false;
                }

            }
            else
            {

                Program.InvApp.Documents.Open(filePath);

                Inventor.PartDocument partDoc;
                partDoc = (Inventor.PartDocument)Program.InvApp.ActiveDocument;
                Inventor.PropertySet propSet = null; 
                
                Inventor.DrawingDocument drawingDoc = null;
               
                bool hasDrawingFile = false;
                //check if there is an assocated drawing file, open it if there is and set.
                //drawing files should live in same directory with the same filename, but have a dwg extension
                var drawingFilePath = Path.GetDirectoryName(filePath) + "/" + Path.GetFileNameWithoutExtension(filePath) + ".dwg";
                hasDrawingFile = File.Exists(drawingFilePath);
                if (hasDrawingFile)
                {
                    Program.InvApp.Documents.Open(drawingFilePath);
                    drawingDoc = (Inventor.DrawingDocument)Program.InvApp.ActiveDocument;
                    propSet = drawingDoc.PropertySets["Design Tracking Properties"];
                }
                partDoc.Activate();

                foreach (var partNumberItem in item.PartNumberConfigurations)
                {
                    var partParams = partDoc.ComponentDefinition.Parameters.UserParameters;
                    var configValue = partNumberItem.Value;
                    if (configValue.ConfigurationDictionary != null)
                    {
                        foreach (var configParam in configValue.ConfigurationDictionary)
                        {
                            partParams[configParam.Key].Expression = configParam.Value;
                        }
                    }
                    
                    partDoc.Update();
                    var fileSavePath = filePath.Replace(CadSourceFolder, CadDestinationFolder);
                    var fileNameWithoutExtension = Path.GetDirectoryName(fileSavePath) + @"\" + item.PartType + "-" + partNumberItem.Key.ToString();
                   
                    partDoc.SaveAs(fileNameWithoutExtension+".ipt", false);
                    PartFileLocations.Add(partNumberItem.Key, fileNameWithoutExtension+".ipt");

                    if(partCatalogItem.ModelOutputType=="STL")
                    {
                        var modelOutputDirectory = CadDestinationFolder + @"\VendorModelOutput\";
                        Directory.CreateDirectory(modelOutputDirectory);
                        partDoc.SaveAs(modelOutputDirectory+ + +item.PartType + "-" + partNumberItem.Key.ToString()+".stl", true);
                    }
                    //Need to place under drawings
                    if (partCatalogItem.ModelOutputType == "DXF")
                    {
                        var modelOutputDirectory = CadDestinationFolder + @"\VendorModelOutput\";
                        Directory.CreateDirectory(modelOutputDirectory);
                        partDoc.SaveAs(modelOutputDirectory + + +item.PartType + "-" + partNumberItem.Key.ToString() + ".dxf", true);
                       
                    }

                    if (hasDrawingFile && drawingDoc != null)
                    {
                        var drawingOutputDirectory = CadDestinationFolder + @"\DrawingOutput\";
                        //TranslationContext oContext;
                        Directory.CreateDirectory(drawingOutputDirectory);
                        var drawingNumberFileName = drawingOutputDirectory + item.PartType + "-" + partNumberItem.Key.ToString() + ".pdf";
                        drawingDoc.Activate();
                        propSet["Part Number"].Value = item.PartType + "-" + partNumberItem.Key.ToString();
                        drawingDoc.Update();
                        drawingDoc.SaveAs(drawingNumberFileName, true);
                        //drawingDoc.SaveAs
                        
                    }
                }
                partDoc.Close(true);
                if (hasDrawingFile && drawingDoc != null) drawingDoc.Close(true);

            }
            return true;
        }

        //https://code.4noobz.net/c-copy-a-folder-its-content-and-the-subfolders/

        public static void CopyAll(DirectoryInfo source, DirectoryInfo target)
        {
            Directory.CreateDirectory(target.FullName);

            // Copy each file into the new directory.
            foreach (FileInfo fi in source.GetFiles())
            {
                fi.CopyTo(Path.Combine(target.FullName, fi.Name), true);
            }

            // Copy each subdirectory using recursion.
            foreach (DirectoryInfo diSourceSubDir in source.GetDirectories())
            {
                DirectoryInfo nextTargetSubDir =
                    target.CreateSubdirectory(diSourceSubDir.Name);
                CopyAll(diSourceSubDir, nextTargetSubDir);
            }
        }
    }
}
