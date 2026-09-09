export interface WeatherCurrent {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  precipitation: number;
  weatherCode: number;
  timestamp: Date;
}

export interface WeatherForecast {
  time: Date;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  precipitationProbability: number;
  /** Global Horizontal Irradiance (W/m²) — total solar radiation on a horizontal surface */
  ghi: number;
  /** Direct Normal Irradiance (W/m²) — direct beam from the sun */
  dni: number;
  /** Diffuse Horizontal Irradiance (W/m²) — scattered radiation */
  dhi: number;
  /** Cloud cover percentage (0-100) */
  cloudCover: number;
}

export interface WeatherDaily {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationSum: number;
  precipitationProbability: number;
  windSpeedMax: number;
  weatherCode: number;
}
