"use client";

import React, { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Moon, Wind, MapPin } from "lucide-react";

interface WeatherData {
  temp: number;
  code: number;
  city: string;
  isDay: number;
}

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Santo Antônio da Patrulha (Default)
  const defaultLat = -29.8248;
  const defaultLon = -50.5186;
  const defaultCity = "Santo Antônio da Patrulha";

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number, cityName: string) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        if (!res.ok) throw new Error("Erro na API");
        const data = await res.json();
        
        setWeather({
          temp: Math.round(data.current_weather.temperature),
          code: data.current_weather.weathercode,
          city: cityName,
          isDay: data.current_weather.is_day
        });
      } catch (err) {
        console.error("Erro ao buscar clima:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude, "Localização Atual");
        },
        (err) => {
          console.warn("Geolocalização negada/falha. Usando padrão.", err);
          fetchWeather(defaultLat, defaultLon, defaultCity);
        }
      );
    } else {
      fetchWeather(defaultLat, defaultLon, defaultCity);
    }
  }, []);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-4 flex items-center justify-between animate-pulse mb-6">
        <div className="h-4 w-32 bg-[#E2E8F0] rounded"></div>
        <div className="h-8 w-8 bg-[#E2E8F0] rounded-full"></div>
      </div>
    );
  }

  if (error || !weather) return null; // Fallback silencioso

  // Determinar visual e mensagem de acordo com o código WMO
  let Icon = weather.isDay === 0 ? Moon : Sun;
  let wrapperClass = "bg-gradient-to-br from-white to-slate-50 border-slate-200/60";
  let iconBoxClass = "bg-amber-100 shadow-sm shadow-amber-200/20";
  let iconColor = "text-amber-500";
  let textColor = "text-slate-800";
  let subtextColor = "text-slate-500";
  let pillClass = "bg-slate-100/80 text-slate-600";
  
  let message = weather.isDay === 0 
    ? "A noite chegou! A academia costuma ser mais tranquila agora. Ótimo momento para um treino focado." 
    : "Clima perfeito lá fora! Excelente dia para mandar aquele pump e quebrar recordes!";

  if (weather.code >= 51) {
    // Chuva
    Icon = CloudRain;
    wrapperClass = weather.isDay === 0 
      ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 shadow-inner" 
      : "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50";
    iconBoxClass = weather.isDay === 0 ? "bg-slate-800/80 shadow-inner border border-slate-700" : "bg-blue-100/80 shadow-sm shadow-blue-200/40";
    iconColor = weather.isDay === 0 ? "text-cyan-400" : "text-blue-500";
    textColor = weather.isDay === 0 ? "text-slate-100" : "text-slate-800";
    subtextColor = weather.isDay === 0 ? "text-slate-400" : "text-slate-500";
    pillClass = weather.isDay === 0 ? "bg-slate-800 text-slate-300 border border-slate-700" : "bg-blue-100 text-blue-700";
    message = "Chuva lá fora? Aqui dentro o clima é de ferro! O ambiente perfeito para focar no treino.";
  } else if (weather.code === 3 || (weather.code >= 45 && weather.code < 51)) {
    // Nublado / Ventando / Neblina
    Icon = weather.code >= 45 ? Wind : Cloud;
    wrapperClass = weather.isDay === 0 
      ? "bg-gradient-to-br from-zinc-900 to-slate-900 border-zinc-800/50" 
      : "bg-gradient-to-br from-slate-100 to-zinc-50 border-slate-200";
    iconBoxClass = weather.isDay === 0 ? "bg-zinc-800/80 border border-zinc-700" : "bg-slate-200/70 shadow-sm";
    iconColor = weather.isDay === 0 ? "text-slate-400" : "text-slate-500";
    textColor = weather.isDay === 0 ? "text-zinc-100" : "text-slate-800";
    subtextColor = weather.isDay === 0 ? "text-zinc-400" : "text-slate-500";
    pillClass = weather.isDay === 0 ? "bg-zinc-800 text-zinc-300 border border-zinc-700" : "bg-slate-200/80 text-slate-600";
    message = weather.isDay === 0 
      ? "Noite nublada, mas a disciplina não tem clima. Bora esmagar os pesos!"
      : "Tempo fechado, mas o seu foco não! O clima ideal para um treino intenso na academia.";
  } else if (weather.isDay === 0) {
    // Noite Limpa
    wrapperClass = "bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] border-[#312E81]/40";
    iconBoxClass = "bg-[#1E1B4B]/80 shadow-inner shadow-indigo-500/10 border border-[#3730A3]/50";
    iconColor = "text-indigo-400";
    textColor = "text-indigo-50";
    subtextColor = "text-indigo-200/70";
    pillClass = "bg-[#1E1B4B] text-indigo-300 border border-[#312E81]";
  } else {
    // Dia Limpo
    wrapperClass = "bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200/50";
    iconBoxClass = "bg-amber-100 shadow-sm shadow-amber-200/30";
    iconColor = "text-amber-500";
    textColor = "text-amber-950";
    subtextColor = "text-amber-700/80";
    pillClass = "bg-amber-100 text-amber-700";
  }

  return (
    <div className={`rounded-3xl p-5 mb-6 border flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden group transition-all duration-500 hover:scale-[1.01] hover:shadow-xl ${wrapperClass}`}>
      {/* Background sutil (ícone gigante) */}
      <div className={`absolute -right-6 -top-6 opacity-[0.03] pointer-events-none transition-transform duration-700 group-hover:scale-125 group-hover:-rotate-12 ${textColor}`}>
        <Icon className="w-40 h-40" />
      </div>

      {/* Ícone */}
      <div className={`p-3.5 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${iconBoxClass}`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      
      {/* Conteúdo */}
      <div className="flex-1 z-10">
        <div className="flex flex-wrap items-center gap-3 mb-1.5">
          <h3 className={`text-2xl font-black flex items-center gap-1 ${textColor} tracking-tight`}>
            {weather.temp}°C
          </h3>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider ${pillClass}`}>
            <MapPin className="w-3 h-3" />
            {weather.city}
          </span>
        </div>
        <p className={`text-xs font-medium leading-relaxed max-w-[90%] ${subtextColor}`}>
          {message}
        </p>
      </div>
    </div>
  );
}
