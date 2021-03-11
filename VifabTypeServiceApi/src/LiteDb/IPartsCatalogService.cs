using System.Collections.Generic;
using TypeServiceLibrary;

namespace VifabTypeServiceApi.LiteDb
{
    public interface IPartsCatalogService
    {
        //int Delete(int id);
        IEnumerable<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem> FindAll();
        TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem FindOne(int id);
        int Insert(TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem partItem);

        bool Delete(int id);

        bool Update(TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem partitem);
        bool UpdateParameter(int id, string parameterId, TypeServiceLibrary.PartTypeDefinitions.PartParameterItem parameterItem);
        bool UpdateParameterResolution(int id, string parameterId, string locationId, TypeServiceLibrary.PartTypeDefinitions.PartParameterItem.PartParameterResolutionItem parameterResolutionItem);
        bool UpdateAssemblyLocation(int id, string assemblyId, TypeServiceLibrary.PartTypeDefinitions.AssemblyLocation assemblyLocationItem);
    }

    public interface IStairConfiguratorService
    {
        //int Delete(int id);
        IEnumerable<TypeServiceLibrary.FlightConfigurator.FlightConfiguration> FindAll();

        FlightConfigurator.FlightConfiguration FindOne(int id);

        int Insert(TypeServiceLibrary.FlightConfigurator.FlightConfiguration configurationItem);

        bool Update(TypeServiceLibrary.FlightConfigurator.FlightConfiguration configurationItem);

        bool Delete(int id);

    }


}