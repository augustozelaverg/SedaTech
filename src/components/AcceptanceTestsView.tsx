import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import {
  CheckCheck,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const AcceptanceTestsView: React.FC = () => {
  const { acceptanceTests, runAcceptanceTest, runAllAcceptanceTests, resetToSeedData } = useTickets();
  const [isRunningAll, setIsRunningAll] = useState(false);

  const handleRunAll = async () => {
    setIsRunningAll(true);
    await runAllAcceptanceTests();
    setIsRunningAll(false);
  };

  const passedCount = acceptanceTests.filter(t => t.estado === 'exito').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 select-none">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#cce4ff] shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center text-3xl font-black shadow-md shadow-sky-500/20">
            🧪
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-display text-[#0a2463]">
                Suite de Pruebas de Aceptación (PA-01 a PA-10)
              </h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-[#0052a5] border border-sky-300">
                Sección 13
              </span>
            </div>
            <p className="text-xs text-[#4b6b94] font-medium mt-0.5">
              Verificación automatizada en vivo de las 10 pruebas contractuales de SedaTech · Sistema de Gestión de Tickets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={resetToSeedData}
            className="px-4 py-2.5 rounded-2xl border-2 border-[#cce4ff] hover:bg-[#f0f7ff] text-xs font-bold text-[#0a2463] bg-white transition-all cursor-pointer flex items-center gap-1.5 min-h-[44px]"
            title="Reiniciar datos iniciales"
          >
            <RotateCcw className="w-4 h-4 text-[#0284c7]" />
            <span>Restablecer Datos</span>
          </button>

          <button
            onClick={handleRunAll}
            disabled={isRunningAll}
            className="px-6 py-3 bg-[#0052a5] hover:bg-[#0a2463] disabled:opacity-50 text-white rounded-2xl text-xs font-black shadow-md btn-spring cursor-pointer flex items-center gap-2 min-h-[44px]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isRunningAll ? 'Ejecutando Suite...' : 'Ejecutar Todas (PA-01 a PA-10)'}</span>
          </button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="p-5 rounded-3xl bg-white border-2 border-[#cce4ff] flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#4b6b94]">
            Progreso de Certificación
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-black font-display text-[#0052a5]">{passedCount}</span>
            <span className="text-base font-bold text-[#4b6b94]">/ 10 Pruebas Aprobadas</span>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-4">
          <div className="w-full h-3.5 bg-[#f0f7ff] rounded-full overflow-hidden p-0.5 border border-[#cce4ff]">
            <div
              style={{ width: `${(passedCount / 10) * 100}%` }}
              className="h-full bg-gradient-to-r from-[#38bdf8] via-[#0284c7] to-[#0052a5] rounded-full transition-all duration-500"
            />
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-[#0a2463]">
            {passedCount === 10 ? '✅ 100% Certificado' : 'Listo para ejecución interactiva'}
          </span>
        </div>
      </div>

      {/* Tests List */}
      <div className="bg-white rounded-3xl border-2 border-[#cce4ff] shadow-sm overflow-hidden">
        <div className="divide-y divide-[#cce4ff]">
          {acceptanceTests.map(test => {
            const isExito = test.estado === 'exito';
            const isEjecutando = test.estado === 'ejecutando';

            return (
              <div
                key={test.id}
                className="p-5 hover:bg-[#f0f7ff] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-sky-100 text-[#0052a5] border border-sky-300">
                      {test.id}
                    </span>

                    <h4 className="text-sm font-black text-[#0a2463]">{test.nombre}</h4>

                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isExito
                          ? 'bg-[#0052a5] text-white'
                          : isEjecutando
                          ? 'bg-[#0ea5e9] text-white animate-pulse'
                          : 'bg-[#f0f7ff] text-[#4b6b94] border border-[#cce4ff]'
                      }`}
                    >
                      {isExito ? 'Aprobado ✓' : isEjecutando ? 'Ejecutando...' : 'Pendiente'}
                    </span>
                  </div>

                  <p className="text-xs text-[#0a2463] font-medium leading-relaxed">
                    <strong>Procedimiento:</strong> {test.procedimiento}
                  </p>

                  <p className="text-xs text-[#4b6b94] mt-0.5">
                    <strong>Resultado esperado:</strong> {test.resultadoEsperado}
                  </p>

                  {test.resultadoObtenido && (
                    <div className="mt-2 p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-[#0a2463] text-xs flex items-center justify-between">
                      <span className="font-semibold">✓ {test.resultadoObtenido}</span>
                      {test.timestamp && (
                        <span className="font-mono text-[10px] text-[#0052a5] ml-2">
                          Hora: {test.timestamp}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="shrink-0 w-full md:w-auto flex justify-end">
                  <button
                    onClick={() => runAcceptanceTest(test.id)}
                    disabled={isEjecutando}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 min-h-[44px] ${
                      isExito
                        ? 'bg-sky-50 hover:bg-sky-100 text-[#0052a5] border border-sky-300'
                        : 'bg-[#0284c7] hover:bg-[#0052a5] text-white shadow-xs'
                    }`}
                  >
                    {isExito ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#0284c7]" />
                        <span>Volver a Probar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Ejecutar {test.id}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
