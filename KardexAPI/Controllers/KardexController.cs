using KardexAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace KardexAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KardexController : ControllerBase
{
    private readonly KardexService _service;

    public KardexController(KardexService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get(DateTime fecha1, DateTime fecha2, string producto)
    {
        var data = await _service.ObtenerKardex(fecha1, fecha2, producto);
        return Ok(data);
    }
}