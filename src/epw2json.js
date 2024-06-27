import * as d3 from 'd3';

function epw2json(epw) {
  const epw_raw = d3.csvParseRows(epw);

  const epwData = {
    _location: {},
    designCondition: {},
    designConditions: {},
    typicalExtremePeriod: {},
    typicalExtremePeriods: {},
    groundTemperature: {},
    groundTemperatures: {},
    holiday: {},
    holidayDaylightSavings: {},
    comments1: {},
    comments2: {},
    dataPeriod: {},
    dataPeriods: {},
    weatherData: []
  };

  const getDataByField = (weatherData, fieldNumber) => {
    return weatherData.map(row => fieldNumber === 5 ? row[fieldNumber] : +row[fieldNumber]);
  };

  const defineEPWFields = (epwObject, weatherData) => {
    const fields = [
      'year', 'month', 'day', 'hour', 'minute', 'uncertainty', 
      'dryBulbTemperature', 'dewPointTemperature', 'relativeHumidity', 
      'atmosphericStationPressure', 'extraterrestrialHorizontalRadiation', 
      'extraterrestrialDirectNormalRadiation', 'horizontalInfraredRadiationIntensity', 
      'globalHorizontalRadiation', 'directNormalRadiation', 'diffuseHorizontalRadiation', 
      'globalHorizontalIlluminance', 'directNormalIlluminance', 'diffuseHorizontalIlluminance', 
      'zenithLuminance', 'windDirection', 'windSpeed', 'totalSkyCover', 'opaqueSkyCover', 
      'visibility', 'ceilingHeight', 'presentWeatherObservation', 'presentWeatherCodes', 
      'precipitableWater', 'aerosolOpticalDepth', 'snowDepth', 'daysSinceLastSnowfall', 
      'albedo', 'liquidPrecipitationDepth', 'liquidPrecipitationQuantity'
    ];

    fields.forEach((field, index) => {
      epwObject[field] = () => getDataByField(weatherData, index);
    });
  };

  const location = epw_raw[0];
  epwData._location = location;
  epwData.stationLocation = location[1];
  epwData.state = location[2];
  epwData.country = location[3];
  epwData.source = location[4];
  epwData.stationID = location[5];
  epwData.latitude = location[6];
  epwData.longitude = location[7];
  epwData.timeZone = location[8];
  epwData.elevation = location[9];

  epwData.dataPeriod = epw_raw[7];
  
  const weatherData = epw_raw.slice(8);

  epwData.weatherData = weatherData;
  defineEPWFields(epwData, weatherData);

  return epwData;
}

export { epw2json };
