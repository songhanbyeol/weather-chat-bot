import { z } from 'zod';

// 날씨 데이터를 위한 스키마 정의
export const weatherSchema = z.object({
  location: z
    .string()
    .describe(
      'The city and state in English, even if the input is in Korean, e.g., Seoul, Jeju.'
    )
    .describe(
      '도시와 주의 이름은 영어로 입력해야 합니다. 입력이 한글일지라도 영어 도시 이름으로 변환되어야 합니다. 예: 서울 -> Seoul, 제주 -> Jeju'
    ),
  nation: z.string().describe('The country or nation of the location, e.g., S.Korea'),
  unit: z
    .enum(['celsius', 'fahrenheit'])
    .describe("The temperature unit to use. Infer this from the user's location."),
  language: z.string().describe('The language of the nation, e.g., 한국어'),
});

// WeatherParams 타입 정의
export type WeatherParams = z.infer<typeof weatherSchema>;

// 날씨 데이터를 가져오는 함수
export async function fetchWeatherData(params: WeatherParams) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_KEY; // OpenWeatherMap API key
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${params.location}&appid=${apiKey}&units=${params.unit === 'celsius' ? 'metric' : 'imperial'}`;

  console.info('fetchWeatherData()', params.location);

  try {
    const response = await fetch(url);

    // 요청에 실패한 경우
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data for ${params.location}: ${response.statusText}`);
    }

    const data = await response.json();

    // 날씨 데이터가 없는 경우
    if (!data || !data.main || !data.weather) {
      throw new Error(`No weather data available for ${params.location}.`);
    }

    console.info(data);

    // 성공적인 응답을 반환
    return {
      location: params.location,
      nation: params.nation,
      temperature: data.main.temp,
      weather: data.weather[0].description,
      unit: params.unit,
      language: params.language,
      details: {
        temperature: data.main.temp,
        weather: data.weather[0].main,
        info: data.weather[0].description,
        feels_like: data.main.feels_like,
        temp_min: data.main.temp_min,
        temp_max: data.main.temp_max,
        pressure: data.main.pressure,
        humidity: data.main.humidity,
        wind_speed: data.wind.speed,
        wind_deg: data.wind.deg,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
      },
    };
  } catch (error) {
    console.error('Failed to fetch weather data:', error);

    // 예외 상황을 처리하여 null을 반환
    return null;
  }
}
