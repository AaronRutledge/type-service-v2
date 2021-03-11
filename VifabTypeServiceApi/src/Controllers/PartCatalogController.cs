using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VifabTypeServiceApi.LiteDb;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Runtime.InteropServices.ComTypes;

namespace VifabTypeServiceApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PartCatalogController : ControllerBase
    {
        private readonly ILogger<PartCatalogController> _logger;
        private readonly IPartsCatalogService _partsCatalogDbService;

        public PartCatalogController(ILogger<PartCatalogController> logger, IPartsCatalogService partsCatalogDbService)
        {
            _partsCatalogDbService = partsCatalogDbService;
            _logger = logger;
        }
    
        [HttpGet]
        public IEnumerable<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem> Get()
        {
            return _partsCatalogDbService.FindAll();
        }

        [HttpGet("{id}", Name = "FindOneStair")]
        public ActionResult<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem> Get(int id)
        {
            var result = _partsCatalogDbService.FindOne(id);
            if (result != default)
                return Ok(result);
            else
                return NotFound();
        }

        [HttpPost]
        public ActionResult<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem> Insert(TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem dto)
        {
            var id = _partsCatalogDbService.Insert(dto);
            if (id != default)
                return CreatedAtRoute("FindOne", new { id = id }, dto);
            else
                return BadRequest();
        }

        [HttpPut]
        public ActionResult<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem> Update(TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem dto)
        {
            var result = _partsCatalogDbService.Update(dto);
            if (result)
                return NoContent();
            else
                return NotFound();
        }

        [HttpPut("{id:int}/partparameter/{parameterId}")]
        public ActionResult<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem> UpdateParameter(int id, string parameterId, TypeServiceLibrary.PartTypeDefinitions.PartParameterItem parameterItem)
        {
            var result = _partsCatalogDbService.UpdateParameter(id, parameterId, parameterItem);
            if (result)
                return NoContent();
            else
                return NotFound();

        }

        //(int id, string parameterId, string locationId, TypeServiceLibrary.PartTypeDefinitions.PartParameterItem.PartParameterResolutionItem resolutionItem)

        [HttpPut("{id:int}/partparameter/{parameterId}/assemblylocation/{locationId}")]
        public ActionResult<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem> UpdateParameterResolution(int id, string parameterId, string locationId, TypeServiceLibrary.PartTypeDefinitions.PartParameterItem.PartParameterResolutionItem resolutionItem)
        {
            var result = _partsCatalogDbService.UpdateParameterResolution(id, parameterId, locationId, resolutionItem);
            if (result)
                return NoContent();
            else
                return NotFound();

        }

        [HttpPut("{id:int}/assemblylocation/{assemblyId}")]
        public ActionResult<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem> UpdateAssemblyLocation(int id, string assemblyId, TypeServiceLibrary.PartTypeDefinitions.AssemblyLocation assemblyLocationItem)
        {
            var result = _partsCatalogDbService.UpdateAssemblyLocation(id, assemblyId, assemblyLocationItem);
            if (result)
                return NoContent();
            else
                return NotFound();

        }
        [HttpDelete("{id}")]

        public ActionResult<TypeServiceLibrary.PartTypeDefinitions.PartCatalogItem> Delete(int id)
        {
            var result = _partsCatalogDbService.Delete(id);
            if (result)
                return NoContent();
            else
                return NotFound();
        }
    }
}
