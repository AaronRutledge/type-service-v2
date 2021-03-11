
using Inventor;
using LiteDB;
using MoreLinq;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using TypeServiceLibrary;

namespace ComponentResolverService
{
    class Program
    {
        public static Application InvApp;
        public static StairConfigurator.Stairwell StairwellConfiguration;
        public static LiteDatabase Db;
        public static LiteDatabase PartNoDb;
        public static Dictionary<int, PartTypeConfigurations> PartTypeConfigurationDictionary;
        public static int RootAssemblyId = 13;

        static void Main(string[] args)
        {
            //This may fail if you run VS as an Administrator
            InvApp = (Inventor.Application)Marshal.GetActiveObject("Inventor.Application");
            InvApp.SilentOperation = true;
            //Stairwell = new List<Component>();
            
            PartTypeConfigurationDictionary = new Dictionary<int, PartTypeConfigurations>();

            //GetData();

            var configFiles = Directory.GetFiles(@"D:\Projects\VifabTypeService\Data\StairConfigs");

            foreach(var filePath in configFiles)
            {
                //TODO:  WOuld be better to make this a class and create a new instance and remove the static types
                PartNoDb = new LiteDatabase(@"D:\Projects\VifabTypeService\Data\PartNumbersData.db");
                PartTypeConfigurationDictionary.Clear();
                using (StreamReader file = System.IO.File.OpenText(filePath))
                {
                    Db = new LiteDatabase(@"D:\Projects\VifabTypeService\Data\PartCatalogData.db");
                    Newtonsoft.Json.JsonSerializer serializer = new Newtonsoft.Json.JsonSerializer();
                    StairwellConfiguration = (StairConfigurator.Stairwell)serializer.Deserialize(file, typeof(StairConfigurator.Stairwell));
                }
                Console.WriteLine("Beginning resolver for " + StairwellConfiguration.StairName);
                var stairwellComponent = new Component(new PartTypeDefinitions.AssemblyLocation() { PartTypeId = 13, LocationId = "root" }, StairwellConfiguration);
                AddToListOfComponents(stairwellComponent);
                System.IO.File.WriteAllText(@"D:\Projects\VifabTypeService\Data\ModelConfigs\" + StairwellConfiguration.StairName + ".json", JsonConvert.SerializeObject(PartTypeConfigurationDictionary));
                //System.IO.File.Move(filePath, @"D:\Projects\VifabTypeService\Data\ConfigArchive\Stairs\" + StairwellConfiguration.StairName + ".json");
                Console.WriteLine("Completed " + StairwellConfiguration.StairName);
                PartNoDb.Dispose();
                Db.Dispose();

            }



            Console.WriteLine("Component resolver service successfully completed.  Press any key to close.");
            Console.ReadKey();
        }
        //TODO:  Not wired up....
        static async void GetData()
        {
            //We will make a GET request to a really cool website...
            Console.WriteLine("Enter stair number:");
            string stairNumber = Console.ReadLine();
            string baseUrl = $"https://localhost:44312/stairConfigurator/{stairNumber}";
            //The 'using' will help to prevent memory leaks.
            //Create a new instance of HttpClient
            using (HttpClient client = new HttpClient())

            //Setting up the response...         

            using (HttpResponseMessage res = await client.GetAsync(baseUrl))
            using (HttpContent content = res.Content)
            {
                string data = await content.ReadAsStringAsync();
                if (data != null)
                {
                    Console.WriteLine(data);
                }
            }
        }

        static Dictionary<string, AssemblyLocationConfiguration> AddAssemblyLocationsToPartItem(Component component)
        {
            //working on this...extract to method  
            var assemblyConfigurations = new Dictionary<string, AssemblyLocationConfiguration>();

            if (component.IsAssembly)
            {
                foreach (var item in component.AssemblyComponents)
                {
                    assemblyConfigurations.Add(item.Key, item.Value.AssemblyLocation);
                }
            }
            return assemblyConfigurations;
        }

        static void AddToListOfComponents(Component component)
        {
            //var dictionaryOfComponentsByPartType = new Dictionary<int, PartTypeConfigurations>();
            try
            {
                //check and add 
                if (!PartTypeConfigurationDictionary.ContainsKey(component.PartTypeId))
                {
                    var partTypeConfiguration = new PartTypeConfigurations(component.PartTypeId, component.IsAssembly, component.ConfigurationOrderPrecedence);

                    partTypeConfiguration.AddPartNumberConfiguration(component.PartNumber, component.ConfigurationValuesDictionary, AddAssemblyLocationsToPartItem(component));
                    PartTypeConfigurationDictionary.Add(component.PartTypeId, partTypeConfiguration);
                }
                else
                {
                    PartTypeConfigurations partTypeConfiguration;
                    if (PartTypeConfigurationDictionary.TryGetValue(component.PartTypeId, out partTypeConfiguration))
                    {
                        if (!partTypeConfiguration.PartNumberConfigurations.ContainsKey(component.PartNumber))
                        {
                        
                            partTypeConfiguration.AddPartNumberConfiguration(component.PartNumber, component.ConfigurationValuesDictionary, AddAssemblyLocationsToPartItem(component));
                        }
                    }
                }

                if (component.AssemblyComponents != null)
                {

                    foreach (var assemblyItem in component.AssemblyComponents)
                    {
                        var c = assemblyItem.Value;
                        //if it is not a 'dead' component' add to list of components
                        if(c.PartTypeId!=0) AddToListOfComponents(c);

                    }
                }
            }
            catch (Exception excpt)
            {
                Console.WriteLine(excpt.Message);
            }

        }

        public static int ResolvePartNumber(int partTypeId, int version, Dictionary<string, string> configurationValuesDictionary)
        {
            var item = new PartNumberItem() { Version = version, PartTypeId = partTypeId, ConfigurationValuesDictionary = configurationValuesDictionary };

            var col = PartNoDb.GetCollection<PartNumberItem>("PartNumber");
            var partItem = col.Query()
                .Where(y => y.PartTypeId == partTypeId)
                .Where(y => y.Version == version)
                .Where(y => y.ConfigurationValuesDictionary == configurationValuesDictionary)
                .FirstOrDefault();

            if (partItem == null)
            {
                col.Insert(item);
                //partNoDb.Dispose();
                return item.PartNumber;
            }
            else
            {
                //partNoDb.Dispose();
                return partItem.PartNumber;
            }

        }

        //TODO:  Move to util another class.  This should eventually live on Forge.
        public static Dictionary<string, string> GetSketchParameters(string filePath, Dictionary<string, string> configurationParameters)
        {

            var sketchOutputParameters = new Dictionary<string, string>();
            Program.InvApp.Documents.Open(filePath);
            Inventor.PartDocument partDoc;
            partDoc = (Inventor.PartDocument)Program.InvApp.ActiveDocument;

            var partParams = partDoc.ComponentDefinition.Parameters.UserParameters;

            foreach (var configParam in configurationParameters)
            {
                partParams[configParam.Key].Expression = configParam.Value;
            }
            partDoc.Update();

            foreach (Inventor.Parameter item in partParams)
            {
                sketchOutputParameters.Add(item.Name, UnitConverter(item));
            }

            partDoc.Close();
            return sketchOutputParameters;

        }
        public static string UnitConverter(Inventor.Parameter param)
        {

            switch (param.get_Units())
            {
                case "in":
                    {
                        return ((double)param.Value / 2.54).ToString();
                    }
                case "deg":
                    {
                        return ((double)param.Value * (180 / Math.PI)).ToString();
                    }
                default:
                    {
                        return param.Value.ToString();
                    }
            }

        }
        public static string ToTitleCase(string str)
        {
            if (str.Length == 0)
                return "";
            else if (str.Length == 1)
                return char.ToUpper(str[0]).ToString();
            else
                return (char.ToUpper(str[0]) + str.Substring(1));

        }
    }
}
