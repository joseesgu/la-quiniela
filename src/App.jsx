import { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Confetti from 'react-confetti';
import 'react-toastify/dist/ReactToastify.css';

const banderas = {
  // Grupo A
  "México": "🇲🇽", "Mexico": "🇲🇽", "Mechico": "🇲🇽",
  "Sudáfrica": "🇿🇦", "South Africa": "🇿🇦",
  "Corea del Sur": "🇰🇷", "South Korea": "🇰🇷",
  "República Checa": "🇨🇿", "Republica Checa": "🇨🇿", "Chequia": "🇨🇿",
  // Grupo B
  "Canadá": "🇨🇦", "Canada": "🇨🇦",
  "Bosnia y Herzegovina": "🇧🇦", "Bosnia": "🇧🇦",
  "Qatar": "🇶🇦", "Catar": "🇶🇦",
  "Suiza": "🇨🇭", "Switzerland": "🇨🇭",
  // Grupo C
  "Brasil": "🇧🇷", "Brazil": "🇧🇷",
  "Marruecos": "🇲🇦", "Morocco": "🇲🇦",
  "Haití": "🇭🇹", "Haiti": "🇭🇹",
  "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  // Grupo D
  "Estados Unidos": "🇺🇸", "United States": "🇺🇸", "USA": "🇺🇸",
  "Paraguay": "🇵🇾",
  "Australia": "🇦🇺",
  "Turquía": "🇹🇷", "Turkey": "🇹🇷", "Turquia": "🇹🇷",
  // Grupo E
  "Alemania": "🇩🇪", "Germany": "🇩🇪",
  "Curazao": "🇨🇼", "Curaçao": "🇨🇼",
  "Costa de Marfil": "🇨🇮", "Ivory Coast": "🇨🇮",
  "Ecuador": "🇪🇨",
  // Grupo F
  "Países Bajos": "🇳🇱", "Netherlands": "🇳🇱", "Paises Bajos": "🇳🇱", "Holanda": "🇳🇱",
  "Japón": "🇯🇵", "Japan": "🇯🇵", "Japon": "🇯🇵",
  "Suecia": "🇸🇪", "Sweden": "🇸🇪",
  "Túnez": "🇹🇳", "Tunisia": "🇹🇳", "Tunez": "🇹🇳",
  // Grupo G
  "Bélgica": "🇧🇪", "Belgium": "🇧🇪", "Belgica": "🇧🇪",
  "Egipto": "🇪🇬", "Egypt": "🇪🇬",
  "Irán": "🇮🇷", "Iran": "🇮🇷",
  "Nueva Zelanda": "🇳🇿", "New Zealand": "🇳🇿",
  // Grupo H
  "España": "🇪🇸", "Spain": "🇪🇸", "Espana": "🇪🇸",
  "Cabo Verde": "🇨🇻", "Cape Verde": "🇨🇻",
  "Arabia Saudita": "🇸🇦", "Saudi Arabia": "🇸🇦",
  "Uruguay": "🇺🇾",
  // Grupo I
  "Francia": "🇫🇷", "France": "🇫🇷",
  "Senegal": "🇸🇳",
  "Irak": "🇮🇶", "Iraq": "🇮🇶",
  "Noruega": "🇳🇴", "Norway": "🇳🇴",
  // Grupo J
  "Argentina": "🇦🇷",
  "Argelia": "🇩🇿", "Algeria": "🇩🇿",
  "Austria": "🇦🇹",
  "Jordania": "🇯🇴", "Jordan": "🇯🇴",
  // Grupo K
  "Portugal": "🇵🇹",
  "RD Congo": "🇨🇩", "DR Congo": "🇨🇩", "República Democrática del Congo": "🇨🇩",
  "Uzbekistán": "🇺🇿", "Uzbekistan": "🇺🇿",
  "Colombia": "🇨🇴",
  // Grupo L
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Croacia": "🇭🇷", "Croatia": "🇭🇷",
  "Ghana": "🇬🇭",
  "Panamá": "🇵🇦", "Panama": "🇵🇦"
};

const getBandera = (equipo) => banderas[equipo] || "🏳️";

const ADMIN_NAME = "José";

// Retorna el formato nativo del calendario YYYY-MM-DD
const getFechaPorDefecto = () => {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, '0');
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const anio = hoy.getFullYear();
  const fechaActual = `${anio}-${mes}-${dia}`;

  // Si abres la app dentro de las fechas del mundial, te muestra el día de hoy.
  // Si no, te carga directamente el día de la inauguración.
  const inicioMundial = new Date('2026-06-11');
  const finMundial = new Date('2026-07-19');
  
  if (hoy >= inicioMundial && hoy <= finMundial) {
    return fechaActual;
  }
  return '2026-06-11'; 
};

function App() {
  const [jugadores, setJugadores] = useState([]);
  const [listaPartidos, setListaPartidos] = useState([]);
  const [prediccionesHoy, setPrediccionesHoy] = useState([]);
  
  const [partidoId, setPartidoId] = useState('');
  const [golesLocal, setGolesLocal] = useState('');
  const [golesVisita, setGolesVisita] = useState('');
  
  const [mostrarConfeti, setMostrarConfeti] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(localStorage.getItem('usuario_quiniela') || '');
  const [fechaConsulta, setFechaConsulta] = useState(getFechaPorDefecto());
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!usuarioActual) {
      const nombre = prompt("¡Bienvenido a la Quiniela! Por favor, escribe tu nombre: (Si eres invitado escribe 'Invitado')");
      if (nombre) {
        localStorage.setItem('usuario_quiniela', nombre);
        setUsuarioActual(nombre);
      }
    }
  }, [usuarioActual]);

  const cargarDatos = async () => {
    setIsLoading(true); 
    setPrediccionesHoy([]); // Limpiamos la pantalla para evitar colapsos al cambiar de fecha
    try {
      const resJugadores = await axios.get('https://quiniela-api-apqx.onrender.com/tabla-posiciones');
      setJugadores(resJugadores.data || []);

      const resPartidos = await axios.get('https://quiniela-api-apqx.onrender.com/partidos');
      const partidosData = resPartidos.data || [];
      
      const partidosOrdenados = partidosData.sort((a, b) => {
        const [diaA, mesA, anioA] = (a.fecha || '').split('/');
        const [diaB, mesB, anioB] = (b.fecha || '').split('/');
        const dateA = new Date(`${anioA}-${mesA}-${diaA}T${a.hora || '00:00'}:00`);
        const dateB = new Date(`${anioB}-${mesB}-${diaB}T${b.hora || '00:00'}:00`);
        return dateA - dateB;
      });
      setListaPartidos(partidosOrdenados);

      // Convertir formato calendario (YYYY-MM-DD) al formato API (DD/MM/YYYY)
      let fechaParaApi = "";
      if (fechaConsulta && fechaConsulta.includes('-')) {
        const [year, month, day] = fechaConsulta.split('-');
        fechaParaApi = `${day}/${month}/${year}`;
      } else {
        fechaParaApi = fechaConsulta;
      }

      const resDiarias = await axios.get(`https://quiniela-api-apqx.onrender.com/predicciones-diarias?fecha=${fechaParaApi}`);
      setPrediccionesHoy(resDiarias.data || []);
      
    } catch (error) {
      console.error(error);
      toast.error("Error conectando con el servidor");
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    if (fechaConsulta) {
      cargarDatos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaConsulta]);

  const registrarResultado = async (e) => {
    e.preventDefault();
    if (!partidoId) {
      toast.warning('Por favor, selecciona un partido.');
      return;
    }

    setIsSubmitting(true); 
    try {
      await axios.post(`https://quiniela-api-apqx.onrender.com/partidos/${partidoId}/resultado?goles_local=${golesLocal}&goles_visita=${golesVisita}`);
      toast.success('¡Resultado guardado y puntos actualizados!');
      setMostrarConfeti(true);
      setTimeout(() => setMostrarConfeti(false), 5000);
      
      setPartidoId('');
      setGolesLocal('');
      setGolesVisita('');
      await cargarDatos(); 
    } catch (error) {
      toast.error('Error al guardar el resultado');
    } finally {
      setIsSubmitting(false); 
    }
  };

  const getEstiloTarjeta = (index) => {
    const baseStyle = "rounded-2xl p-6 border flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-default ";
    if (index === 0) return baseStyle + "bg-gradient-to-br from-yellow-100 to-yellow-300 dark:from-yellow-600 dark:to-yellow-800 border-yellow-400 transform scale-105 shadow-xl";
    if (index === 1) return baseStyle + "bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-600 dark:to-gray-800 border-gray-400 shadow-lg";
    if (index === 2) return baseStyle + "bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-700 dark:to-orange-900 border-orange-300 shadow-lg";
    return baseStyle + "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md";
  };

  const obtenerEstiloPrediccion = (partido, pred) => {
    if (!partido || !partido.procesado) {
      return "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 text-blue-600 dark:text-blue-400";
    }

    const localReal = parseInt(partido.goles_local_real);
    const visitaReal = parseInt(partido.goles_visita_real);
    const localPred = parseInt(pred?.goles_local_pred);
    const visitaPred = parseInt(pred?.goles_visita_pred);

    if (isNaN(localReal) || isNaN(visitaReal) || isNaN(localPred) || isNaN(visitaPred)) {
      return "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 text-gray-500";
    }

    // Acierto EXACTO
    if (localReal === localPred && visitaReal === visitaPred) {
      return "bg-green-100 dark:bg-green-900/40 border-green-500 dark:border-green-500 text-green-700 dark:text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.4)]";
    }

    // Acierto GANADOR/EMPATE
    const diffReal = localReal - visitaReal;
    const diffPred = localPred - visitaPred;
    
    const aciertoGanador = 
      (diffReal > 0 && diffPred > 0) || 
      (diffReal < 0 && diffPred < 0) || 
      (diffReal === 0 && diffPred === 0); 

    if (aciertoGanador) {
      return "bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-100";
    }

    // Fallo Total
    return "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 text-red-500 dark:text-red-400/70 opacity-75 grayscale-[50%]";
  };

  const cambiarUsuario = () => {
    localStorage.removeItem('usuario_quiniela');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 p-4 md:p-8 font-sans relative">
      <ToastContainer position="top-right" autoClose={3000} theme={isDarkMode ? "dark" : "light"} />
      {mostrarConfeti && <Confetti recycle={false} numberOfPieces={500} />}

      <div className="absolute top-4 right-4 flex items-center gap-4 z-50">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className="text-2xl hover:scale-110 transition-transform"
          title="Alternar Modo Oscuro"
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
        <div className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer" onClick={cambiarUsuario}>
          Usuario actual: <span className="font-bold">{usuarioActual}</span> (Cambiar)
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8">
        
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-600 dark:from-green-400 dark:to-blue-500 drop-shadow-sm">
            🏆 La Quiniela
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium tracking-wide">Torneo Mundial 2026</p>
        </header>
        
        <div className="sticky top-4 z-40 mb-10 flex flex-wrap justify-center sm:justify-start items-center gap-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300">
          <span className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            📅 <span className="hidden sm:inline">Selecciona el día del partido:</span>
          </span>
          <input 
            type="date" 
            value={fechaConsulta} 
            onChange={(e) => setFechaConsulta(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 font-semibold bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-gray-700 dark:text-gray-100 transition-colors"
          />
        </div>

        <div className="mb-14">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">⚽ Cartelera y Predicciones del Grupo</h3>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="animate-pulse bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 h-80">
                  <div className="bg-gray-300 dark:bg-gray-600 h-16 w-full rounded-t-2xl"></div>
                  <div className="p-4 space-y-4 mt-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : prediccionesHoy.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 text-center shadow-sm transition-colors">
              <div className="text-6xl mb-4 opacity-50 grayscale">🏟️</div>
              <h4 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">Sin partidos programados</h4>
              <p className="text-gray-400 dark:text-gray-500">No hay encuentros para la fecha seleccionada. ¡Prueba navegando en el calendario!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prediccionesHoy.map((partido) => (
                <div key={partido?.partido_id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="bg-gray-800 dark:bg-gray-950 text-white p-4 text-center border-b border-gray-700">
                    <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Hora: {partido?.hora}</div>
                    <div className="flex justify-center items-center gap-3 text-lg font-bold">
                      <span>{getBandera(partido?.equipo_local)} <span className="hidden sm:inline">{partido?.equipo_local}</span></span>
                      <span className="bg-gray-700 px-3 py-1 rounded-md text-sm shadow-inner">
                        {partido?.procesado ? `${partido?.goles_local_real} - ${partido?.goles_visita_real}` : "vs"}
                      </span>
                      <span><span className="hidden sm:inline">{partido?.equipo_visita}</span> {getBandera(partido?.equipo_visita)}</span>
                    </div>
                  </div>
                  
                  <div className="p-5 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-3 text-center tracking-widest">Predicciones</div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                      {partido?.predicciones?.map((pred, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 text-sm">
                          <span className={`font-medium transition-colors ${
                            partido.procesado && parseInt(partido.goles_local_real) === parseInt(pred?.goles_local_pred) && parseInt(partido.goles_visita_real) === parseInt(pred?.goles_visita_pred)
                              ? "text-green-600 dark:text-green-400 font-bold" 
                              : "text-gray-700 dark:text-gray-300"
                          }`}>
                            {pred?.jugador}
                          </span>
                          <span className={`border px-3 py-1 rounded-lg font-mono font-bold transition-all duration-300 ${obtenerEstiloPrediccion(partido, pred)}`}>
                            {pred?.goles_local_pred} - {pred?.goles_visita_pred}
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
        
        {usuarioActual === ADMIN_NAME && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mb-14 border-l-4 border-l-green-500 transition-all">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              ⚙️ Cargar Marcador Oficial
            </h3>
            <form onSubmit={registrarResultado} className="flex flex-col gap-5">
              <select 
                value={partidoId} 
                onChange={(e) => setPartidoId(e.target.value)} 
                required
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none w-full transition-colors"
              >
                <option value="">-- Selecciona un partido --</option>
                {listaPartidos?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fecha} - {p.hora} | {getBandera(p.equipo_local)} {p.equipo_local} vs {p.equipo_visita} {getBandera(p.equipo_visita)} {p.procesado === 1 ? '✅' : ''}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  <input 
                    type="number" placeholder="L" value={golesLocal} 
                    onChange={(e) => setGolesLocal(e.target.value)} required min="0"
                    className="w-16 p-2 text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                  />
                  <span className="font-bold text-gray-400">-</span>
                  <input 
                    type="number" placeholder="V" value={golesVisita} 
                    onChange={(e) => setGolesVisita(e.target.value)} required min="0"
                    className="w-16 p-2 text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md flex-grow md:flex-grow-0 text-white
                    ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5'}
                  `}
                >
                  {isSubmitting ? 'Cargando datos...' : 'Guardar Resultado Real'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="pb-20">
          <h3 className="text-2xl font-bold mb-6 border-b-2 border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2">🏆 Tabla de Posiciones</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jugadores?.map((jugador, index) => (
              <div key={jugador.id} className={getEstiloTarjeta(index)}>
                <div className="text-5xl mb-3 drop-shadow-md">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : <span className="text-gray-400 font-bold text-4xl">{index + 1}</span>}
                </div>
                <h2 className="text-2xl font-extrabold text-center mb-1 tracking-tight">{jugador.nombre}</h2>
                <div className="bg-white/80 dark:bg-gray-900/80 px-5 py-2 rounded-full mt-3 shadow-inner border border-white/50 dark:border-gray-700 backdrop-blur-sm">
                  <span className="text-3xl font-black text-gray-900 dark:text-white">{jugador.puntos_totales}</span>
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-wider">pts</span>
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