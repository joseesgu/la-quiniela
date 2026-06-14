import { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Confetti from 'react-confetti';
import 'react-toastify/dist/ReactToastify.css';

const banderas = {
  "Mechico": "🇲🇽", "México": "🇲🇽",
  "South Africa": "🇿🇦", "Sudáfrica": "🇿🇦",
  "Corea del Sur": "🇰🇷",
  "Republica Checa": "🇨🇿", "Chequia": "🇨🇿"
};

const getBandera = (equipo) => banderas[equipo] || "🏳️";

function App() {
  const [jugadores, setJugadores] = useState([]);
  const [listaPartidos, setListaPartidos] = useState([]);
  const [prediccionesHoy, setPrediccionesHoy] = useState([]); // Nuevo estado
  
  const [partidoId, setPartidoId] = useState('');
  const [golesLocal, setGolesLocal] = useState('');
  const [golesVisita, setGolesVisita] = useState('');
  const [mostrarConfeti, setMostrarConfeti] = useState(false);
  
  // Guardamos la fecha de consulta (puedes cambiarla dinámicamente)
  const [fechaConsulta, setFechaConsulta] = useState('13/06/2026');

  const cargarDatos = async () => {
    try {
      const resJugadores = await axios.get('https://quiniela-api-apqx.onrender.com/tabla-posiciones');
      setJugadores(resJugadores.data);

      const resPartidos = await axios.get('https://quiniela-api-apqx.onrender.com/partidos');
      setListaPartidos(resPartidos.data);

      // Cargar las predicciones detalladas de la fecha elegida
      const resDiarias = await axios.get(`https://quiniela-api-apqx.onrender.com/predicciones-diarias?fecha=${fechaConsulta}`);
      setPrediccionesHoy(resDiarias.data);
    } catch (error) {
      toast.error("Error conectando con el servidor");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [fechaConsulta]); // Se recarga si cambia la fecha de consulta

  const registrarResultado = async (e) => {
    e.preventDefault();
    if (!partidoId) {
      toast.warning('Por favor, selecciona un partido.');
      return;
    }

    try {
      await axios.post(`https://quiniela-api-apqx.onrender.com/partidos/${partidoId}/resultado?goles_local=${golesLocal}&goles_visita=${golesVisita}`);
      toast.success('¡Resultado guardado y puntos actualizados!');
      setMostrarConfeti(true);
      setTimeout(() => setMostrarConfeti(false), 5000);
      
      setPartidoId('');
      setGolesLocal('');
      setGolesVisita('');
      cargarDatos(); 
    } catch (error) {
      toast.error('Error al guardar el resultado');
    }
  };

  const getEstiloTarjeta = (index) => {
    if (index === 0) return "bg-gradient-to-br from-yellow-100 to-yellow-300 border-yellow-400 transform scale-105 shadow-xl";
    if (index === 1) return "bg-gradient-to-br from-gray-100 to-gray-300 border-gray-400 shadow-lg";
    if (index === 2) return "bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300 shadow-lg";
    return "bg-white border-gray-200 shadow-md";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      {mostrarConfeti && <Confetti recycle={false} numberOfPieces={500} />}

      <div className="max-w-4xl mx-auto">
        
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
            🏆 La Quiniela
          </h1>
          <p className="text-gray-500 mt-2">Torneo Mundial 2026</p>
        </header>
        
        {/* CONTROLADOR DE FECHA DE CONSULTA */}
        <div className="mb-6 flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <span className="font-bold text-gray-700">📅 Viendo partidos del día:</span>
          <input 
            type="text" 
            value={fechaConsulta} 
            onChange={(e) => setFechaConsulta(e.target.value)}
            className="border border-gray-300 rounded p-1 text-center font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="DD/MM/YYYY"
          />
        </div>

        {/* NUEVA SECCIÓN: PREDICCIONES POR PARTIDO */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">⚽ Cartelera y Predicciones del Grupo</h3>
          {prediccionesHoy.length === 0 ? (
            <p className="text-gray-500 italic bg-white p-4 rounded-xl border text-center">No hay partidos registrados para esta fecha.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prediccionesHoy.map((partido) => (
                <div key={partido.partido_id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                  {/* Encabezado del Partido */}
                  <div className="bg-gray-800 text-white p-4 text-center">
                    <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Hora: {partido.hora}</div>
                    <div className="flex justify-center items-center gap-3 text-lg font-bold">
                      <span>{getBandera(partido.equipo_local)} {partido.equipo_local}</span>
                      <span className="bg-gray-700 px-2 py-0.5 rounded text-sm">
                        {partido.procesado ? `${partido.goles_local_real} - ${partido.goles_visita_real}` : "vs"}
                      </span>
                      <span>{partido.equipo_visita} {getBandera(partido.equipo_visita)}</span>
                    </div>
                  </div>
                  
                  {/* Listado de Predicciones de los Amigos */}
                  <div className="p-4 bg-gray-50/50">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-2">Predicciones de los muchachos:</div>
                    <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                      {partido.predicciones.map((pred, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 text-sm text-gray-700">
                          <span className="font-medium">{pred.jugador}</span>
                          <span className="bg-white border font-mono px-3 py-0.5 rounded-lg shadow-sm font-bold text-blue-600">
                            {pred.goles_local_pred} - {pred.goles_visita_pred}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* SECCIÓN DEL FORMULARIO DE ADMINISTRACIÓN */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-10">
          <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            ⚙️ Panel de Administrador: Cargar Marcador Oficial
          </h3>
          <form onSubmit={registrarResultado} className="flex flex-col gap-4">
            <select 
              value={partidoId} 
              onChange={(e) => setPartidoId(e.target.value)} 
              required
              className="p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:outline-none w-full md:w-2/3"
            >
              <option value="">-- Selecciona un partido --</option>
              {listaPartidos.map((p) => (
                <option key={p.id} value={p.id}>
                  {getBandera(p.equipo_local)} {p.equipo_local} vs {p.equipo_visita} {getBandera(p.equipo_visita)} | {p.fecha} {p.hora} {p.procesado === 1 ? '✅' : ''}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                <input 
                  type="number" placeholder="Local" value={golesLocal} 
                  onChange={(e) => setGolesLocal(e.target.value)} required 
                  className="w-20 p-2 text-center rounded border border-gray-300 focus:outline-none"
                />
                <span className="font-bold text-gray-400">-</span>
                <input 
                  type="number" placeholder="Visita" value={golesVisita} 
                  onChange={(e) => setGolesVisita(e.target.value)} required 
                  className="w-20 p-2 text-center rounded border border-gray-300 focus:outline-none"
                />
              </div>
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md">
                Guardar Resultado Real
              </button>
            </div>
          </form>
        </div>

        {/* SECCIÓN DE TARJETAS (TABLA DE POSICIONES) */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-gray-200 pb-2">🏆 Posiciones del Grupo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jugadores.map((jugador, index) => (
              <div key={jugador.id} className={`rounded-2xl p-6 border flex flex-col items-center justify-center transition duration-300 ${getEstiloTarjeta(index)}`}>
                <div className="text-4xl mb-2">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : <span className="text-gray-400 font-bold">{index + 1}</span>}
                </div>
                <h2 className="text-xl font-bold text-gray-800 text-center mb-1">{jugador.nombre}</h2>
                <div className="bg-white/60 px-4 py-1 rounded-full mt-2 shadow-inner">
                  <span className="text-2xl font-extrabold text-gray-900">{jugador.puntos_totales}</span>
                  <span className="text-sm text-gray-600 ml-1">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;