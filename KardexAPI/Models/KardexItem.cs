namespace KardexAPI.Models;

public class KardexItem
{
    public DateTime Fecha { get; set; }
    public string Documento { get; set; } = "";
    public string Movimiento { get; set; } = "";

    public decimal Entrada { get; set; }
    public decimal CostoEntrada { get; set; }

    public decimal Salida { get; set; }
    public decimal CostoSalida { get; set; }

    public decimal Saldo { get; set; }
    public decimal CostoPromedio { get; set; }
    public decimal ValorSaldo { get; set; }
}