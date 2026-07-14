"use client";

import React, { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Thermometer, MapPin } from "lucide-react";

interface WeatherData {
  temp: number;
  code: number;
  city: string;
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
          city: cityName
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

  // Determinar ícone e mensagem de acordo com o código WMO
  // 0-2: Sol/Parcialmente nublado
  // 3: Nublado
  // 45-48: Neblina
  // 51-99: Chuva/Neve/Tempestade
  let Icon = Sun;
  let iconColor = "text-amber-500";
  let message = "Clima perfeito lá fora! Excelente dia para mandar aquele pump e quebrar recordes!";

  if (weather.code >= 51) {
    Icon = CloudRain;
    iconColor = "text-blue-500";
    message = "Chuva lá fora? Aqui dentro o clima é de ferro! O ambiente perfeito para focar no treino.";
  } else if (weather.code === 3 || weather.code >= 45) {
    Icon = Cloud;
    iconColor = "text-[#94A3B8]";
    message = "Tempo nublado, mas a disciplina não tem clima. Bora esmagar os pesos!";
  }

  return (
    <div className="glass-card rounded-2xl p-5 mb-6 border border-[#E2E8F0]/80 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden group hover:border-[#2563EB]/30 transition-all duration-300">
      {/* Background sutil */}
      <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none transition-transform duration-500 group-hover:scale-110">
        <Icon className="w-32 h-32" />
      </div>

      <div className={`p-3 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      
      <div className="flex-1 z-10">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-1">
            {weather.temp}°C
          </h3>
          <span className="text-xs font-medium bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {weather.city}
          </span>
        </div>
        <p className="text-sm text-[#475569] leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
