using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TypeServiceLibrary;
using VifabTypeServiceApi.LiteDb;
using static TypeServiceLibrary.StairConfigurator;

namespace VifabTypeServiceApi.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class StairConfiguratorController : ControllerBase
    {
        private readonly ILogger<StairConfiguratorController> _logger;
        private readonly IStairConfiguratorService _stairConfiguratorDbService;

        public StairConfiguratorController(ILogger<StairConfiguratorController> logger, IStairConfiguratorService stairConfiguratorDbService)
        {
            _stairConfiguratorDbService = stairConfiguratorDbService;
            _logger = logger;
        }

        [HttpGet]
        public IEnumerable<FlightConfigurator.FlightConfiguration> Get()
        {
            return _stairConfiguratorDbService.FindAll();
        }

        [HttpGet("{id}", Name = "FindOne")]
        public ActionResult<Stairwell> Get(int id)
        {
            var result = _stairConfiguratorDbService.FindOne(id);

            var flights = new List<StairFlight>();


            foreach (var item in result.Flights)
            {
                var flight = new StairFlight()
                {
                    FlightId = item.FlightNumber-1,
                    //Name = item.FlightName,
                    TopElevation = item.Elevation,
                    BottomElevation = item.Elevation - item.StairRise,
                    IsClockwise = result.StairData.Orientation.Equals("CLOCKWISECLOCKWISE"),
                    Risers = item.Risers,
                    RiserHeight = item.RiserHeight,
                    RiseHeight = item.StairRise,
                    //if it is a bridge, add top dog leg length as well so we can make lengths other than increments of 11 work.
                    RunLength = item.StairRun + (item.IsBridge ? item.TopDogLegLength : 0),
                    IsDdl = item.IsDdl,
                    IsDogLeg = item.IsTopDogLeg,
                    IsBridge = item.IsBridge,
                    DogLegLength = item.TopDogLegLength,
                    LandingWidth=item.LandingWidth - result.StairData.StairEdgeClearance,
                    StairWidth = result.StairData.StairWidth,
                    LandingLength = result.StairData.StairwellWidth-result.StairData.StairEdgeClearance*2,
                    StairEdgeOffset= result.StairData.StairEdgeClearance,
                    //TDOD: Add to configurator
                    ExteriorRailType = "handrail",
                    InteriorRailType= "guardrail",
                    StringerThickness = item.StringerThickness,
                    HasSafetyGate = item.HasSafetyGate
                    //RailingPanelType= "horizontalPicket"
                };
                flights.Add(flight);

            }


            var stairwell = new StairConfigurator.Stairwell()
            {
                Id = result.StairNumber,
                StairWidth = result.StairData.StairWidth.ToString(),
                StairName = result.StairData.StairName,
                StairEdgeOffset = result.StairData.StairEdgeClearance,
                StairwellWidth = result.StairData.StairwellWidth - 2 * result.StairData.StairEdgeClearance,
                StairLength = result.StairData.StairwellLength - 2 * result.StairData.StairEdgeClearance,
                Flights = flights.OrderBy(o=>o.FlightId).ToList()
            };

            if (result != default)
                return Ok(stairwell);
            else
                return NotFound();
        }

        [HttpPost]
        public ActionResult<FlightConfigurator.FlightConfiguration> Insert(FlightConfigurator.FlightConfiguration dto)
        {
            var id = _stairConfiguratorDbService.Insert(dto);
            if (id != default)
                return CreatedAtRoute("FindOne", new { id = id }, dto);
            else
                return BadRequest();
        }

        [HttpPut]
        public ActionResult<FlightConfigurator.FlightConfiguration> Update(FlightConfigurator.FlightConfiguration dto)
        {
            var result = _stairConfiguratorDbService.Update(dto);
            if (result)
                return NoContent();
            else
                return NotFound();
        }



        [HttpDelete("{id}")]

        public ActionResult<FlightConfigurator.FlightConfiguration> Delete(int id)
        {
            var result = _stairConfiguratorDbService.Delete(id);
            if (result)
                return NoContent();
            else
                return NotFound();
        }


    }
}
