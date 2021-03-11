using LiteDB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace VifabTypeServiceApi.LiteDb
{
    public class PartsCatalogService : IPartsCatalogService
    {

        private LiteDatabase _liteDb;

        public PartsCatalogService(ILiteDbContext liteDbContext)
        {
            _liteDb = liteDbContext.Database;
        }

        public IEnumerable<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem> FindAll()
        {
            var result = _liteDb.GetCollection<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem>("PartCatalog")
                .FindAll();
            return result;
        }

        public TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem FindOne(int id)
        {
            return _liteDb.GetCollection<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem>("PartCatalog")
                .Find(x => x.PartTypeId == id).FirstOrDefault();
        }

        public bool Delete(int id)
        {
            var value = new LiteDB.BsonValue(id);
            return _liteDb.GetCollection<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem>("PartCatalog")
                .Delete(value);
        }

        public int Insert(TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem partItem)
        {
            return _liteDb.GetCollection<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem>("PartCatalog")
                .Insert(partItem);
        }

        public bool Update(TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem partItem)
        {
            return _liteDb.GetCollection<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem>("PartCatalog")
                .Update(partItem);
        }

        public bool UpdateParameter(int id, string parameterId, TypeServiceLibrary.PartTypeDefinitions.PartParameterItem parameterItem)
        {
            var partItem = _liteDb.GetCollection<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem>("PartCatalog")
                .Find(x => x.PartTypeId == id).FirstOrDefault();
            var index = partItem.PartParameterList.IndexOf(partItem.PartParameterList.First(i => i.ParameterId == parameterId));
            if (index != -1) partItem.PartParameterList[index] = parameterItem;

            return _liteDb.GetCollection<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem>("PartCatalog")
                .Update(partItem);
        }
        public bool UpdateParameterResolution(int id, string parameterId, string locationId, TypeServiceLibrary.PartTypeDefinitions.PartParameterItem.PartParameterResolutionItem resolutionItem)
        {
            TypeServiceLibrary.PartTypeDefinitions.PartParameterItem parameterItem = new TypeServiceLibrary.PartTypeDefinitions.PartParameterItem();
            var partItem = _liteDb.GetCollection<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem>("PartCatalog")
                .Find(x => x.PartTypeId == id).FirstOrDefault();
            var index = partItem.PartParameterList.IndexOf(partItem.PartParameterList.First(i => i.ParameterId == parameterId));
            if (index != -1) parameterItem = partItem.PartParameterList[index];
            if(parameterItem.PartParameterResolutionDictionary.ContainsKey(locationId))
            {
                parameterItem.PartParameterResolutionDictionary[locationId] = resolutionItem;
            }
            else
            {
                parameterItem.PartParameterResolutionDictionary.Add(locationId, resolutionItem);
            }
            var cat = partItem;

            return _liteDb.GetCollection<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem>("PartCatalog")
                .Update(partItem);
        }

        public bool UpdateAssemblyLocation(int id, string assemblyId, TypeServiceLibrary.PartTypeDefinitions.AssemblyLocation assemblyLocationItem)
        {
            var partItem = _liteDb.GetCollection<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem>("PartCatalog")
                .Find(x => x.PartTypeId == id).FirstOrDefault();
            var index = partItem.AssemblyLocationList.IndexOf(partItem.AssemblyLocationList.First(i => i.LocationId == assemblyId));
            if (index != -1) partItem.AssemblyLocationList[index] = assemblyLocationItem;

            return _liteDb.GetCollection<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem>("PartCatalog")
                .Update(partItem);
        }
        

    }
}
