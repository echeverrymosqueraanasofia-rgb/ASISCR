import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Shield } from 'lucide-react';

export const ContactView: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ nombre: '', email: '', asunto: '', mensaje: '' });
    }, 4000);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#faf5e8] py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ea580c] text-white rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
          <Shield className="w-3 h-3" />
          <span>SOPORTE Y ATENCIÓN INSTITUCIONAL</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#3b1406] tracking-tight mb-3 uppercase">
          Contáctanos
        </h1>
        <p className="text-sm font-medium text-[#78350f]">
          Atención a la comunidad educativa de la Institución Educativa Cristo Rey en Dosquebradas. Escríbenos o visita nuestras instalaciones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Contact Info Card */}
        <div className="bg-[#fffbeb] border-2 border-[#fde68a] rounded-2xl p-6 space-y-6 shadow-xs">
          <h2 className="text-lg font-black text-[#3b1406] pb-2 border-b-2 border-[#fde68a] uppercase">
            Información Institucional
          </h2>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#3b1406] text-amber-300 border border-[#ca8a04]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-[#3b1406]">Sede Principal</span>
              <p className="text-xs font-medium text-[#78350f]">Carrera 16 # 35 - 20, Dosquebradas, Risaralda</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#3b1406] text-amber-300 border border-[#ca8a04]">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-[#3b1406]">Teléfono PBX</span>
              <p className="text-xs font-medium text-[#78350f]">+57 (606) 322-8000 / Ext. 101</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#3b1406] text-amber-300 border border-[#ca8a04]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-[#3b1406]">Correo Institucional</span>
              <p className="text-xs font-medium text-[#78350f]">contacto@iecristorey.edu.co</p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2 border-t border-[#fde68a]">
            <div className="p-2.5 rounded-xl bg-[#3b1406] text-amber-300 border border-[#ca8a04]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-[#3b1406]">Horario de Secretaría</span>
              <p className="text-xs font-medium text-[#78350f]">Lunes a Viernes: 7:00 AM – 3:00 PM</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 bg-[#fffbeb] border-2 border-[#fde68a] rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl font-black text-[#3b1406] mb-4 tracking-tight uppercase">
            Envíanos un mensaje
          </h2>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-center text-emerald-900">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-extrabold text-base mb-1">¡Mensaje Recibido!</h3>
              <p className="text-xs text-emerald-800 font-medium">
                La secretaría académica revisará tu solicitud y te contactará a la brevedad.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3b1406] mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Tu nombre completo"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#f59e0b]/40 rounded-xl text-sm font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3b1406] mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="ejemplo@correo.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#f59e0b]/40 rounded-xl text-sm font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3b1406] mb-1">
                  Asunto
                </label>
                <input
                  type="text"
                  required
                  value={form.asunto}
                  onChange={(e) => setForm({ ...form, asunto: e.target.value })}
                  placeholder="Ej: Solicitud de certificado o consulta de asistencias..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#f59e0b]/40 rounded-xl text-sm font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3b1406] mb-1">
                  Mensaje
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.mensaje}
                  onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                  placeholder="Escribe aquí tu solicitud detallada..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#f59e0b]/40 rounded-xl text-sm font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl font-bold text-sm shadow-md transition-colors inline-flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Solicitud</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};

