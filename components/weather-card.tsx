export default function WeatherCard({ data }: { data: string | null }) {
  // data가 null이거나 비어 있는 경우 처리
  if (!data) {
    return (
      <div className="p-6 text-white bg-red-500 rounded-lg shadow-md">
        날씨 정보를 가져올 수 없습니다.
      </div>
    );
  }

  let parsedData;
  try {
    parsedData = JSON.parse(data);
  } catch (error) {
    return (
      <div className="p-6 text-white bg-red-500 rounded-lg shadow-md">
        잘못된 데이터 형식입니다.
      </div>
    );
  }

  // 데이터가 올바르게 파싱되었는지 확인
  if (!parsedData || !parsedData.location || !parsedData.nation || !parsedData.details) {
    return (
      <div className="p-6 text-white bg-red-500 rounded-lg shadow-md">
        필요한 날씨 데이터가 없습니다.
      </div>
    );
  }

  const { location, nation, temperature, weather, unit, details } = parsedData;

  // 날씨 아이콘을 반환하는 함수
  function getWeatherIcon(weather: string) {
    switch (weather) {
      case 'Clear':
        return '☀️';
      case 'Clouds':
        return '☁️';
      case 'Rain':
        return '🌧️';
      case 'Snow':
        return '❄️';
      case 'Mist':
        return '🌫️';
      default:
        return '🌈';
    }
  }

  return (
    <div className="p-6 text-white bg-blue-300 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold">
        {location}, {nation}
      </h2>
      <div className="flex items-center justify-between">
        <span>{weather}</span>
        <span className="text-4xl">{getWeatherIcon(weather)}</span>
      </div>
      <p className="mt-2 text-4xl font-semibold">
        {temperature}°{unit === 'celsius' ? 'C' : 'F'}
      </p>
      
    </div>
  );
}
