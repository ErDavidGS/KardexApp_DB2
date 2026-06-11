import { useMemo, useState } from "react";
import axios from "axios";
import "./Kardex.css";

export default function Kardex() {
  const [fecha1, setFecha1] = useState("2003-05-01");
  const [fecha2, setFecha2] = useState("2004-12-31");
  const [producto, setProducto] = useState("PR01");
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);

  const buscar = async () => {
    try {
      setCargando(true);

      const response = await axios.get("/api/kardex", {
        params: { fecha1, fecha2, producto },
      });

      setDatos(response.data);
    } catch (error) {
      console.error(error);
      alert("Error consultando kardex");
    } finally {
      setCargando(false);
    }
  };

  const ultimo = datos.length > 0 ? datos[datos.length - 1] : null;

  const resumen = useMemo(() => {
    const entradas = datos.reduce((acc, x) => acc + Number(x.entrada || 0), 0);
    const salidas = datos.reduce((acc, x) => acc + Number(x.salida || 0), 0);

    return {
      entradas,
      salidas,
      saldoNegativo: ultimo && Number(ultimo.saldo) < 0,
    };
  }, [datos, ultimo]);

  const numero = (valor) =>
    Number(valor ?? 0).toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const moneda = (valor) =>
    `S/ ${Number(valor ?? 0).toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <main className="kardex-page">
      <div className="bg-noise" />

      <section className="app-shell">
        <header className="app-header">
          <div>
            <span className="overline">IBM Db2 Cloud</span>
            <h1>Kardex Valorizado</h1>
            <p>Consulta de movimientos, saldo y costo promedio por producto.</p>
          </div>

          <div className="product-chip">
            <span>Producto</span>
            <strong>{producto || "—"}</strong>
          </div>
        </header>

        <section className="panel">
          <div className="filters">
            <div className="field">
              <label>Fecha inicio</label>
              <input
                type="date"
                value={fecha1}
                onChange={(e) => setFecha1(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Fecha fin</label>
              <input
                type="date"
                value={fecha2}
                onChange={(e) => setFecha2(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Producto</label>
              <input
                type="text"
                value={producto}
                onChange={(e) => setProducto(e.target.value.toUpperCase())}
                placeholder="PR01"
              />
            </div>

            <button onClick={buscar} disabled={cargando} className="btn-primary">
              {cargando ? (
                <>
                  <span className="spinner" />
                  Consultando
                </>
              ) : (
                "Consultar"
              )}
            </button>
          </div>
        </section>

        {ultimo && resumen.saldoNegativo && (
          <div className="alert">
            <strong>Saldo negativo detectado.</strong>
            <span>
              Las salidas superan a las entradas registradas en el rango seleccionado.
            </span>
          </div>
        )}

        {ultimo && (
          <section className="metrics">
            <article className={resumen.saldoNegativo ? "metric danger" : "metric"}>
              <span>Saldo final</span>
              <strong>{numero(ultimo.saldo)}</strong>
            </article>

            <article className="metric">
              <span>Costo promedio</span>
              <strong>{moneda(ultimo.costoPromedio)}</strong>
            </article>

            <article className={resumen.saldoNegativo ? "metric danger" : "metric"}>
              <span>Valor saldo</span>
              <strong>{moneda(ultimo.valorSaldo)}</strong>
            </article>

            <article className="metric">
              <span>Movimientos</span>
              <strong>{datos.length}</strong>
              <small>
                E: {numero(resumen.entradas)} · S: {numero(resumen.salidas)}
              </small>
            </article>
          </section>
        )}

        <section className="table-card">
          <div className="table-toolbar">
            <div>
              <h2>Detalle de movimientos</h2>
              <p>
                {datos.length > 0
                  ? `${datos.length} registros encontrados`
                  : "Realiza una consulta para visualizar el Kardex."}
              </p>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Documento</th>
                  <th>Movimiento</th>
                  <th>Entrada</th>
                  <th>Costo Entrada</th>
                  <th>Salida</th>
                  <th>Costo Salida</th>
                  <th>Saldo</th>
                  <th>Costo Prom.</th>
                  <th>Valor Saldo</th>
                </tr>
              </thead>

              <tbody>
                {datos.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="empty">
                      Sin resultados. Ingresa un producto y consulta su Kardex.
                    </td>
                  </tr>
                ) : (
                  datos.map((item, index) => (
                    <tr key={index}>
                      <td>{item.fecha?.substring(0, 10)}</td>
                      <td className="doc">{item.documento}</td>
                      <td>
                        <span className={`tag ${item.movimiento.toLowerCase()}`}>
                          {item.movimiento}
                        </span>
                      </td>
                      <td>{numero(item.entrada)}</td>
                      <td>{moneda(item.costoEntrada)}</td>
                      <td>{numero(item.salida)}</td>
                      <td>{moneda(item.costoSalida)}</td>
                      <td className={Number(item.saldo) < 0 ? "negative" : ""}>
                        {numero(item.saldo)}
                      </td>
                      <td>{moneda(item.costoPromedio)}</td>
                      <td className={Number(item.valorSaldo) < 0 ? "negative" : ""}>
                        {moneda(item.valorSaldo)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}