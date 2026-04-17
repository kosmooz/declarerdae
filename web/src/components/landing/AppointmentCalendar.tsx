"use client";

/**
 * AppointmentCalendar - Calendrier de prise de RDV avec un conseiller STAR aid
 * Design "Urgence Clinique" : rouge #d92d20, blanc, DM Sans
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Phone, Mail, Building2, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30"
];

const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

function getWeekDays(startDate: Date): Date[] {
  const days: Date[] = [];
  const start = new Date(startDate);
  // Find Monday
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDate(date: Date): string {
  return `${date.getDate()} ${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

function getInitialWeekOffset(): number {
  const now = new Date();
  const day = now.getDay();
  // If it's weekend (Sat=6 or Sun=0) or Friday afternoon, show next week
  if (day === 0 || day === 6) return 1;
  if (day === 5 && now.getHours() >= 16) return 1;
  return 0;
}

export default function AppointmentCalendar() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [weekOffset, setWeekOffset] = useState(getInitialWeekOffset);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + weekOffset * 7);
  const weekDays = getWeekDays(weekStart);

  // Simulate some unavailable slots
  const getAvailableSlots = (date: Date) => {
    if (isPast(date)) return [];
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return [];
    // Friday has shorter hours
    if (dayOfWeek === 5) return TIME_SLOTS.filter(t => t < "15:30");
    return TIME_SLOTS;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setStep(3);
    toast.success("Votre rendez-vous a été confirmé !");
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress steps */}
      <div className="flex items-center justify-center gap-4 mb-10">
        {[
          { num: 1, label: "Choisir un créneau" },
          { num: 2, label: "Vos coordonnées" },
          { num: 3, label: "Confirmation" },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-sans transition-colors ${
              step >= s.num ? "bg-[#d92d20] text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
            </div>
            <span className={`text-sm font-sans hidden sm:inline ${step >= s.num ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
              {s.label}
            </span>
            {i < 2 && <div className={`w-8 md:w-16 h-0.5 ${step > s.num ? "bg-[#d92d20]" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Calendar */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gray-50 p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 font-sans flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#d92d20]" />
                Choisissez votre créneau
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                  disabled={weekOffset === 0}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-semibold text-gray-700 font-sans min-w-[140px] text-center">
                  {MONTHS_FR[weekDays[0].getMonth()]} {weekDays[0].getFullYear()}
                </span>
                <button
                  onClick={() => setWeekOffset(weekOffset + 1)}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Days header */}
            <div className="grid grid-cols-5 gap-3 mb-4">
              {weekDays.map((day) => {
                const past = isPast(day);
                const selected = selectedDate && isSameDay(day, selectedDate);
                const todayDay = isToday(day);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => {
                      if (!past && day.getDay() !== 0 && day.getDay() !== 6) {
                        setSelectedDate(day);
                        setSelectedTime(null);
                      }
                    }}
                    disabled={past}
                    className={`p-3 rounded-xl text-center transition-all ${
                      selected
                        ? "bg-[#d92d20] text-white shadow-lg shadow-red-200 ring-2 ring-[#d92d20]/30"
                        : past
                        ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                        : todayDay
                        ? "bg-red-50 text-[#d92d20] border-2 border-[#d92d20] hover:bg-red-100"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-[11px] font-semibold font-sans uppercase tracking-wide">{DAYS_FR[day.getDay()]}</div>
                    <div className="text-2xl font-bold font-sans my-0.5">{day.getDate()}</div>
                    <div className={`text-[11px] font-sans ${selected ? "text-white/70" : past ? "text-gray-300" : "text-gray-400"}`}>
                      {MONTHS_FR[day.getMonth()].slice(0, 4)}.
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3 font-sans flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#d92d20]" />
                  Créneaux disponibles le {formatDate(selectedDate)}
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {getAvailableSlots(selectedDate).map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2.5 px-3 rounded-lg text-sm font-semibold font-sans transition-all ${
                        selectedTime === time
                          ? "bg-[#d92d20] text-white shadow-md"
                          : "bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-[#d92d20] border border-gray-200"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Continue button */}
            {selectedDate && selectedTime && (
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  className="bg-[#d92d20] hover:bg-[#b91c1c] text-white font-bold px-8 py-5"
                >
                  Continuer
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Form */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gray-50 p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 font-sans flex items-center gap-2">
              <User className="w-5 h-5 text-[#d92d20]" />
              Vos coordonnées
            </h3>
            <p className="text-sm text-gray-500 font-sans mt-1">
              RDV le <strong>{selectedDate && formatDate(selectedDate)}</strong> à <strong>{selectedTime}</strong>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-sans">Prénom *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-[#d92d20] focus:ring-2 focus:ring-[#d92d20]/20 outline-none font-sans text-sm"
                    placeholder="Votre prénom"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-sans">Nom *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-[#d92d20] focus:ring-2 focus:ring-[#d92d20]/20 outline-none font-sans text-sm"
                    placeholder="Votre nom"
                  />
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-sans">Téléphone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-[#d92d20] focus:ring-2 focus:ring-[#d92d20]/20 outline-none font-sans text-sm"
                    placeholder="+262 6XX XX XX XX"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-sans">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-[#d92d20] focus:ring-2 focus:ring-[#d92d20]/20 outline-none font-sans text-sm"
                    placeholder="votre@email.fr"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-sans">Entreprise / Établissement</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-[#d92d20] focus:ring-2 focus:ring-[#d92d20]/20 outline-none font-sans text-sm"
                  placeholder="Nom de votre structure"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-sans">Message (optionnel)</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#d92d20] focus:ring-2 focus:ring-[#d92d20]/20 outline-none font-sans text-sm resize-none"
                placeholder="Décrivez votre besoin ou posez vos questions..."
              />
            </div>
            <div className="flex gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="px-6 py-5 font-semibold"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#d92d20] hover:bg-[#b91c1c] text-white font-bold py-5 text-base"
              >
                Confirmer le rendez-vous
                <CheckCircle2 className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-sans">
              Rendez-vous confirmé !
            </h3>
            <p className="text-lg text-gray-600 font-sans mb-6 max-w-md mx-auto">
              Un conseiller STAR aid vous contactera le <strong>{selectedDate && formatDate(selectedDate)}</strong> à <strong>{selectedTime}</strong>.
            </p>
            <div className="bg-gray-50 rounded-xl p-6 max-w-sm mx-auto mb-8">
              <div className="space-y-3 text-left text-sm font-sans">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="w-4 h-4 text-[#d92d20]" />
                  <span>{selectedDate && formatDate(selectedDate)} à {selectedTime}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <User className="w-4 h-4 text-[#d92d20]" />
                  <span>{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-4 h-4 text-[#d92d20]" />
                  <span>{formData.phone}</span>
                </div>
                {formData.company && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Building2 className="w-4 h-4 text-[#d92d20]" />
                    <span>{formData.company}</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 font-sans">
              Besoin d'aide ? Appelez-nous au <a href="tel:+262262150950" className="text-[#d92d20] font-semibold hover:underline">+262 262 150 950</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
