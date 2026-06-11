using System.Data;
using IBM.Data.Db2;
using KardexAPI.Models;

namespace KardexAPI.Services;

public class KardexService
{
    private readonly IConfiguration _configuration;

    public KardexService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<List<KardexItem>> ObtenerKardex(DateTime fecha1, DateTime fecha2, string producto)
    {
        var lista = new List<KardexItem>();
        var cadena = _configuration.GetConnectionString("Db2");

        using var cn = new DB2Connection(cadena);
        using var cmd = cn.CreateCommand();

        cmd.CommandText = "CALL SP_KARDEX_DB2(?, ?, ?)";
        cmd.CommandType = CommandType.Text;

        cmd.Parameters.Add(new DB2Parameter { DB2Type = DB2Type.Timestamp, Value = fecha1 });
        cmd.Parameters.Add(new DB2Parameter { DB2Type = DB2Type.Timestamp, Value = fecha2 });
        cmd.Parameters.Add(new DB2Parameter { DB2Type = DB2Type.VarChar, Value = producto });

        await cn.OpenAsync();

        using var dr = await cmd.ExecuteReaderAsync();

        while (await dr.ReadAsync())
        {
            lista.Add(new KardexItem
            {
                Fecha = Convert.ToDateTime(dr["FECHA"]),
                Documento = dr["DOCUMENTO"].ToString() ?? "",
                Movimiento = dr["MOVIMIENTO"].ToString() ?? "",
                Entrada = Convert.ToDecimal(dr["ENTRADA"]),
                CostoEntrada = Convert.ToDecimal(dr["COSTOENTRADA"]),
                Salida = Convert.ToDecimal(dr["SALIDA"]),
                CostoSalida = Convert.ToDecimal(dr["COSTOSALIDA"]),
                Saldo = Convert.ToDecimal(dr["SALDO"]),
                CostoPromedio = Convert.ToDecimal(dr["COSTOPROMEDIO"]),
                ValorSaldo = Convert.ToDecimal(dr["VALORSALDO"])
            });
        }

        return lista;
    }
}