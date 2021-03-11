using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LiteDB;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TypeServiceLibrary;

namespace VifabTypeServiceApi.LiteDb
{

    public class StairConfiguratorService : IStairConfiguratorService
    {
        private LiteDatabase _liteDb;

        public StairConfiguratorService(ILiteDbContext liteDbContext)
        {
            _liteDb = liteDbContext.Database;
        }
        public IEnumerable<FlightConfigurator.FlightConfiguration> FindAll()
        {
            var result = _liteDb.GetCollection<FlightConfigurator.FlightConfiguration>("StairConfigurations").FindAll();
            return result;
        }
        public FlightConfigurator.FlightConfiguration FindOne(int id)
        {
            return _liteDb.GetCollection<FlightConfigurator.FlightConfiguration>("StairConfigurations")
                .Find(x => x.StairNumber == id).FirstOrDefault();
        }
        public int Insert(FlightConfigurator.FlightConfiguration configurationItem)
        {
            return _liteDb.GetCollection<FlightConfigurator.FlightConfiguration>("StairConfigurations")
                .Insert(configurationItem);
        }

        public bool Update(FlightConfigurator.FlightConfiguration configurationItem)
        {
            return _liteDb.GetCollection<FlightConfigurator.FlightConfiguration>("StairConfigurations").Update(configurationItem);
        }

        public bool Delete(int id)
        {
            var value = new LiteDB.BsonValue(id);
            return _liteDb.GetCollection<FlightConfigurator.FlightConfiguration>("StairConfigurations")
                .Delete(value);
        }
    }
}
