import React from 'react';
import { X, ShieldCheck, Key, Lock, FileSpreadsheet, EyeOff, Server, Database } from 'lucide-react';

interface SecurityBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityBadgeModal: React.FC<SecurityBadgeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const securitySpecs = [
    {
      title: 'Contraseñas & Criptografía',
      value: 'Argon2id',
      desc: 'Función de derivación de claves resistente a ataques por fuerza bruta, GPU y ASIC.',
      icon: Key,
      color: 'blue',
    },
    {
      title: 'Gestión de Sesiones',
      value: 'Cookie HttpOnly · Secure · SameSite=Strict',
      desc: 'Rotación periódica de tokens de sesión y expiración automática con mitigación de secuestro de sesión.',
      icon: Lock,
      color: 'sky',
    },
    {
      title: 'Protección contra CSRF',
      value: 'Tokens anti-CSRF en mutaciones',
      desc: 'Validación en todos los métodos POST/PUT/DELETE que modifican estados de tickets o prioridades.',
      icon: ShieldCheck,
      color: 'blue',
    },
    {
      title: 'Validación de Entradas',
      value: 'Esquemas de validación estricta',
      desc: 'Sanitización de cadenas, prevención de XSS e inyecciones en asunto, descripción y solución técnica obligatoria.',
      icon: Server,
      color: 'sky',
    },
    {
      title: 'Auditoría Transaccional',
      value: 'Append-Only Inmutable',
      desc: 'Libro de bitácora no modificable sin permisos de DELETE o UPDATE, registrando actor, timestamp y evento.',
      icon: Database,
      color: 'blue',
    },
    {
      title: 'Seguridad en Exportaciones CSV',
      value: 'Mitigación de Inyección de Fórmulas',
      desc: 'Prefijado de celdas con apóstrofe si comienzan con =, +, -, @ para proteger aplicaciones como Excel.',
      icon: FileSpreadsheet,
      color: 'sky',
    },
    {
      title: 'Observabilidad & Privacidad',
      value: 'Logs estructurados sin PII sensible',
      desc: 'Registro de auditoría sin filtración de credenciales, tokens ni datos personales desprotegidos.',
      icon: EyeOff,
      color: 'blue',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#061c47]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-[#cce4ff] max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#0052a5] flex items-center justify-between bg-[#0a2463] text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0284c7]/30 text-sky-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black">Arquitectura de Seguridad & Estándares</h2>
              <p className="text-xs text-sky-200">
                Especificaciones de seguridad y resiliencia implementadas en SedaTech · Sistema de Gestión de Tickets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-sky-200 hover:text-white hover:bg-[#0052a5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3.5 bg-[#f0f7ff]">
          {securitySpecs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-3.5 bg-white rounded-xl border border-[#cce4ff] shadow-2xs flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-sky-100 text-[#0052a5] mt-0.5 shrink-0">
                  <Icon className="w-4 h-4 text-[#0284c7]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-xs font-bold text-[#0a2463]">{item.title}</span>
                    <span className="font-mono text-[11px] font-bold text-[#0052a5] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {item.value}
                    </span>
                  </div>
                  <p className="text-xs text-[#4b6b94] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#cce4ff] bg-white flex items-center justify-between text-xs text-[#4b6b94]">
          <span>Cumplimiento OWASP ASVS y directivas de integridad SedaTech · Sistema de Gestión de Tickets</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-bold text-[#0052a5] bg-[#f0f7ff] hover:bg-sky-100 rounded-lg cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
