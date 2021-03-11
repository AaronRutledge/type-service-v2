using Jint;
using Jint.Parser;
using Jint.Runtime;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TypeServiceLibrary;

namespace ComponentResolverService
{

    public class Component //Consider making an interface with part and assembly classes implementing it
    {
        //TODO:  SHould these top few props be a PartTypeConfigurations obj from library?  One difference is that this represents an individual part and not a part type collection.
        public bool IsAssembly { get; set; }
        public int ConfigurationOrderPrecedence { get; set; }
        public int SketchLayoutId { get; set; }
        public int PartTypeId { get; set; }
        public int PartNumber { get; set; }

        public Dictionary<string, string> ConfigurationValuesDictionary { get; set; }

        public Dictionary<string, string> AssemblyConfigurationValuesDictionary { get; set; }

        public AssemblyLocationConfiguration AssemblyLocation { get; set; }

        public Dictionary<string, Component> AssemblyComponents { get; set; }
        [JsonIgnore]
        public dynamic ConfiguratorObj { get; set; }
        [JsonIgnore]
        public PartTypeDefinitions.PartCatalogItem ItemFromDb { get; set; }
        [JsonIgnore]
        public Dictionary<string, string> LayoutSketchValuesDictionary { get; set; }

        //This constructor only used to set 'dead' components if assembly location will be deleted
        public Component()
        {
            AssemblyLocation = new AssemblyLocationConfiguration();

        }
        public Component(PartTypeDefinitions.AssemblyLocation assemblyLocation, dynamic configuratorObj, Dictionary<string, string> assemblyConfigurationValuesDictionary = null,  Dictionary<string, string> sketchParameters = null)
        {

            PartTypeId = assemblyLocation.PartTypeId;
            var col = Program.Db.GetCollection<PartTypeDefinitions.PartCatalogItem>("PartCatalog");
            ItemFromDb = col.Query()
                .Where(y => y.PartTypeId == PartTypeId).FirstOrDefault();
            PartTypeId = ItemFromDb.PartTypeId;
            IsAssembly = ItemFromDb.PartProperties.IsAssembly;
            ConfigurationOrderPrecedence = ItemFromDb.PartProperties.ConfigurationOrderPrecedence;
           
            if (!String.IsNullOrEmpty(ItemFromDb.DrivingConfigObjectSelector))
            {
                try
                {
                    var jsResolver = new Engine().Execute(ItemFromDb.DrivingConfigObjectSelector); // execute a statement
                    //var jsonConfiguratorObj = JsonConvert.SerializeObject(configuratorObj);
                    var values = jsResolver.Invoke("out", configuratorObj, assemblyLocation.LocationType).ToObject();
                    ConfiguratorObj = values;
                }
                catch(ParserException pEx)
                {
                    Console.WriteLine("invalid js encountered", pEx.Message);
                }
            }
            else{
                ConfiguratorObj = configuratorObj;
            }
           

            AssemblyLocation = new AssemblyLocationConfiguration()
            {
                LocationId = assemblyLocation.LocationId,
                LocationType = assemblyLocation.LocationType,
                IsPatterned = assemblyLocation.PositionType == "PATTERNED",
                PositionType = assemblyLocation.PositionType
            };
            AssemblyLocation.LocationType = assemblyLocation.LocationType;


            if (sketchParameters != null) LayoutSketchValuesDictionary = sketchParameters;
            if (IsAssembly)
            {
                if (PartTypeId == 71)
                {
                    var dog = "cat";
                }
                var sketchLayoutId = ItemFromDb.DrivingLayoutPartTypeId;
                //note: layout parts should not have any SKETCH driven parameters to start.  Possibly revist if this is helpfull in the future.
                var layoutPartAssemblyLocation = ItemFromDb.AssemblyLocationList.Find(x => x.PartTypeId == sketchLayoutId);

                var layoutComponent = new Component(layoutPartAssemblyLocation, ConfiguratorObj, assemblyConfigurationValuesDictionary);
                //var layoutComponent = new Component(layoutPartAssemblyLocation, ConfiguratorObj, ConfigurationValuesDictionary);


                if (layoutComponent.ConfigurationValuesDictionary != null) LayoutSketchValuesDictionary = Program.GetSketchParameters(layoutComponent.ItemFromDb.PartProperties.FilePath, layoutComponent.ConfigurationValuesDictionary);
                //fid assembly location of layot part in assembly

                //TODO:  This uses the ui assigned layout, but that may not be the actual layout used in the part.  You should fix this.
                
                AssemblyConfigurationValuesDictionary = assemblyConfigurationValuesDictionary;
                if (ItemFromDb.PartParameterList.Count > 0) SetConfigurationValues();
                //setting initially to parent assmebly for configuration.  We then overwrite.  This doesn't feel right and should be refactored.
                AssemblyConfigurationValuesDictionary = ConfigurationValuesDictionary;
               
                //layoutComponent.SetConfigurationValues();


                //AssemblyConfigurationValuesDictionary = assemblyConfigurationValuesDictionary;
               
                //if (ItemFromDb.PartParameterList.Count > 0) SetConfigurationValues();

            }
            else
            {
                AssemblyConfigurationValuesDictionary = assemblyConfigurationValuesDictionary;
                if (ItemFromDb.PartParameterList.Count > 0) SetConfigurationValues();
            }

              

            PartNumber = Program.ResolvePartNumber((int)PartTypeId, 1, ConfigurationValuesDictionary);
            AssemblyLocation.PartNumber = PartNumber;
            if (IsAssembly) SetAssemblyComponents();

            //TODO:  look at why I am using part number here....
           

        }
        public class AssemblyLocationParameters
        {
            public string distance;
            public string number;
        }

        public void SetAssemblyComponents()
        {
            AssemblyComponents = new Dictionary<string, Component>();
            foreach (var item in ItemFromDb.AssemblyLocationList)
            {


                
                string distance = "";
                bool delete = false;
                if (item.ResolutionType == "EVALUATELAMBDA")
                {
                    var jsResolver = new Engine().Execute(item.LambdaFunction); // execute a statement
                    dynamic values = jsResolver.Invoke("out", ConfiguratorObj, LayoutSketchValuesDictionary, item.LocationType).ToObject();
                    try
                    {

                        distance = values.distance.ToString();
                        delete = values.delete;

                    }
                    catch
                    {
                        Console.WriteLine("Invalid return typ from js object");
                    }
                }
                Component component;
                if (!delete)
                {
                    component = new Component(item, ConfiguratorObj, AssemblyConfigurationValuesDictionary, LayoutSketchValuesDictionary);

                }
                else{
                    //we are going to delet this locatiom.  Instantiate a dead component
                    component = new Component();
                }
                component.AssemblyLocation.Distance = distance;
                component.AssemblyLocation.Delete = delete;
                //if (component.ItemFromDb.PartTypeId == 26)
                //{
                //    var dog = "cat";
                //}
                AssemblyComponents.Add(item.LocationId, component);

            }

        }
        public void SetConfigurationValues()
        {
            ConfigurationValuesDictionary = new Dictionary<string, string>();
            foreach (var item in ItemFromDb.PartParameterList)
            {
                PartTypeDefinitions.PartParameterItem.PartParameterResolutionItem resolutionItem;
                if (item.PartParameterResolutionDictionary.Count > 0 && item.PartParameterResolutionDictionary.TryGetValue(AssemblyLocation.LocationId, out resolutionItem))
                {

                    switch (resolutionItem.ResolutionType)
                    {
                        case "SKETCH":
                            {
                                // call static method that takes skecth id and parameter and returns it.
                                //we'll do a lookup on the SketchParameters dictionary.
                                string value;
                                if (LayoutSketchValuesDictionary.TryGetValue(resolutionItem.DrivingInputName, out value))
                                {
                                    ConfigurationValuesDictionary.Add(item.Name, value.ToString());
                                }

                                break;
                            }
                        case "ASSEMBLYPARAMETER":
                            {
                                // call static method that takes skecth id and parameter and returns it.
                                //we'll do a lookup on the SketchParameters dictionary.
                                string value;
                                if (AssemblyConfigurationValuesDictionary.TryGetValue(resolutionItem.DrivingInputName, out value))
                                {
                                    ConfigurationValuesDictionary.Add(item.Name, value.ToString());
                                }

                                break;
                            }
                        case "MAPPEDTOCONFIGPROP":
                            {
                                var property = Program.ToTitleCase(resolutionItem.DrivingInputName);
                                var value = ConfiguratorObj.GetType().GetProperty(property).GetValue(ConfiguratorObj, null);
                                ConfigurationValuesDictionary.Add(item.Name, value.ToString());
                                break;
                            }
                        case "LAMBDAFUNCTION":
                            {

                                var jsResolver = new Engine().Execute(resolutionItem.LambdaFunction); // execute a statement
                                var value = TypeConverter.ToString(jsResolver.Invoke("out", ConfiguratorObj, LayoutSketchValuesDictionary, AssemblyConfigurationValuesDictionary, AssemblyLocation.LocationType
                                    )).ToString();
                                ConfigurationValuesDictionary.Add(item.Name, value);


                                break;
                            }

                        case "STATIC":
                            ConfigurationValuesDictionary.Add(item.Name, resolutionItem.DefaultStaticValue);
                            break;
                        case "NO RESOLUTION":
                        default:
                            {
                                break;
                            }
                    }
                }
            }
        }
    }
}
