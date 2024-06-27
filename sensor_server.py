from flask import Flask, jsonify, request
import math
import pandas as pd
import numpy as np
from datetime import timedelta, datetime
import time
from sklearn.linear_model import LinearRegression
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

flag_ac = True

################################################################################
def calculate_temp_ef(temp):

    if temp >= 27:
        return 100
    elif 25 <= temp < 27:
        return 90 + (temp - 25) * 5
    elif 23 <= temp < 25:
        return 80 + (temp - 23) * 5
    elif temp < 23:
        return max(50, 80 - (23 - temp) * 10)

def calculate_ach_ef(ach):

    if ach >= 10:
        return 0
    elif 8 <= ach < 10:
        return 80 - (ach - 8) * 40
    elif 6 <= ach < 8:
        return 100 - (ach - 6) * 5
    elif ach < 6:
        return max(0, 90 - (6 - ach) * 15)

def calculate_energy_factor(temp, ach):

    temp_ef = calculate_temp_ef(temp)
    ach_ef = calculate_ach_ef(ach)
    ef = (temp_ef + ach_ef) / 2

    return ef
########################################################################################33

def calculate_iew_temperature(temp_current, temp_comfort, temp_band=2):
    if temp_comfort - temp_band <= temp_current <= temp_comfort + temp_band:
        return 100 - 10 * abs(temp_current - temp_comfort)
    else:
        delta_t = abs(temp_current - temp_comfort) - temp_band
        return max(50, 90 - 20 * delta_t)

###################################################################################
def calculate_iew_humidity(humidity_current):
    if 5 <= humidity_current <= 30:
        x1, y1 = 5, 50
        x2, y2 = 30, 90
    elif 30 < humidity_current <= 50:
        x1, y1 = 30, 90
        x2, y2 = 50, 100
    elif 50 < humidity_current <= 70:
        x1, y1 = 50, 100
        x2, y2 = 70, 80
    elif 70 < humidity_current <= 100:
        x1, y1 = 70, 80
        x2, y2 = 100, 50
    else:
        raise ValueError("Humidity value is out of expected range.")
    
    iew_rh = y1 + ((humidity_current - x1) / (x2 - x1)) * (y2 - y1)
    return iew_rh

############################################################################
def calculate_iew_pm25(pm25_current, pm_max=200):
    if pm25_current <= 15:
        x1, y1 = 0, 100
        x2, y2 = 15, 95
    elif 15 < pm25_current <= 30:
        x1, y1 = 15, 95
        x2, y2 = 30, 75
    elif 30 < pm25_current <= 50:
        x1, y1 = 30, 75
        x2, y2 = 50, 60
    elif 50 < pm25_current <= 100:
        x1, y1 = 50, 60
        x2, y2 = 100, 50
    elif pm25_current > 100:
        x1, y1 = 100, 50
        x2, y2 = pm_max, 0
    else:
        raise ValueError("PM2.5 value is out of expected range.")
    
    iew_pm_25 = y1 + ((pm25_current - x1) / (x2 - x1)) * (y2 - y1)
    return iew_pm_25

############################################################################
def calculate_iew_co2(co2_current, co2_max=5000):
    if co2_current <= 800:
        x1, y1 = 0, 100
        x2, y2 = 800, 95
    elif 800 < co2_current <= 1000:
        x1, y1 = 800, 95
        x2, y2 = 1000, 90
    elif 1000 < co2_current <= 1200:
        x1, y1 = 1000, 90
        x2, y2 = 1200, 70
    elif 1200 < co2_current <= 1400:
        x1, y1 = 1200, 70
        x2, y2 = 1400, 50
    elif co2_current > 1400:
        x1, y1 = 1400, 50
        x2, y2 = co2_max, 0
    else:
        raise ValueError("CO2 value is out of expected range.")
    
    iew_co2 = y1 + ((co2_current - x1) / (x2 - x1)) * (y2 - y1)
    return iew_co2

def calculate_iew_ach(ach_current, ach_max=20):
    if ach_current <= 3:
        x1, y1 = 0, 0
        x2, y2 = 3, 50
    elif 3 < ach_current <= 6:
        x1, y1 = 3, 50
        x2, y2 = 6, 90
    elif 6 < ach_current <= 10:
        x1, y1 = 6, 90
        x2, y2 = 10, 100
    elif ach_current > 10:
        x1, y1 = 10, 100
        x2, y2 = ach_max, 80
    else:
        raise ValueError("ACH value is out of expected range.")
    
    iew = y1 + ((ach_current - x1) / (x2 - x1)) * (y2 - y1)
    return iew

def calculate_iew_tvoc(tvoc_current, tvoc_max=2000):
    if tvoc_current <= 500:
        x1, y1 = 0, 100
        x2, y2 = 500, 90
    elif 500 < tvoc_current <= 1000:
        x1, y1 = 500, 90
        x2, y2 = 1000, 0
    else:
        raise ValueError("TVOC value is out of expected range.")
    
    iew = y1 + ((tvoc_current - x1) / (x2 - x1)) * (y2 - y1)
    return iew

def calculate_wellness_index(temp_current, humidity_current, pm25_current, co2_current, ach_current, tvoc_current, guideline):

    if guideline == 'GG':
        return calculate_energy_factor(temp_current, ach_current)


    # Calculate individual IEW indices
    iew_temp = calculate_iew_temperature(temp_current, 25)
    iew_humidity = calculate_iew_humidity(humidity_current)
    iew_pm25 = calculate_iew_pm25(pm25_current)
    iew_co2 = calculate_iew_co2(co2_current)
    iew_ach = calculate_iew_ach(ach_current)    
    iew_tvoc = calculate_iew_tvoc(tvoc_current)
    
    # Define weights based on the selected guideline
    guidelines = {
        'TC': {'temperature': 0.25, 'humidity': 0.25, 'ach': 0.125, 'pm25': 0.125, 'co2': 0.125, 'tvoc': 0.125},
        'AQ': {'temperature': 0.11, 'humidity': 0.11, 'ach': 0.11, 'pm25': 0.22, 'co2': 0.22, 'tvoc': 0.22},
        'PP': {'temperature': 0.1, 'humidity': 0.1, 'ach': 0.1, 'pm25': 0.3, 'co2': 0.1, 'tvoc': 0.3},
        'GG': {'temperature': 0.2, 'humidity': 0.2, 'ach': 0.2, 'pm25': 0.2, 'co2': 0.2, 'tvoc': 0.2},
        'IEW': {'temperature': 0.16, 'humidity': 0.16, 'ach': 0.16, 'pm25': 0.16, 'co2': 0.16, 'tvoc': 0.16}
    }
    
    weights = guidelines.get(guideline, guidelines['IEW'])
    
    # Calculate weighted average
    wellness_index = (iew_temp * weights['temperature'] +
                      iew_humidity * weights['humidity'] +
                      iew_pm25 * weights['pm25'] +
                      iew_co2 * weights['co2'] +
                      iew_ach * weights['ach'] +
                      iew_tvoc * weights['tvoc'])
    
    return wellness_index


def fetch_data_with_retry(url, retries=15, delay=1):
    for attempt in range(retries):
        try:
            df = pd.read_csv(url)
            if df.empty:
                print(url)
                raise ValueError("DataFrame is empty")
            if attempt > 0:
                print(f"Data fetched successfully on attempt {attempt + 1}")
            return df
        except ValueError as ve:
            print(f"Attempt {attempt + 1} failed due to empty DataFrame. Error: {ve}")
            if attempt < retries - 1:
                print("Retrying...")
                time.sleep(delay)
        except Exception as e:
            print(f"Attempt {attempt + 1} failed. Error: {e}")
            if attempt < retries - 1:
                print("Retrying...")
                time.sleep(delay)
    raise RuntimeError(f"Failed after {retries} attempts")

def get_historical_hourly_data(imei, data_type):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=5)
    
    start_date_str = start_date.strftime('%Y-%m-%dT%H:%M')
    end_date_str = end_date.strftime('%Y-%m-%dT%H:%M')
    
    url = (f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/{imei}/params/temp,humidity,co2conc/'
          +f'startdate/{start_date_str}/enddate/{end_date_str}/'
          +f'ts/hh/avg/1/api/{data_type}?gaps=1&gap_value=NULL')
    
    df = fetch_data_with_retry(url)
    
    df["dt_time"] = pd.to_datetime(df["dt_time"])
    df.set_index("dt_time", inplace=True, drop=True)
    
    hourly_data = df.resample('h').mean(numeric_only=True)

    hourly_data = hourly_data.reset_index()
    hourly_data = round(hourly_data, 1)
    hourly_data['time'] = hourly_data['dt_time'].dt.strftime('%Y-%m-%dT%H:%M')
    humidity_data = hourly_data[['time', 'humidity']].dropna().to_dict(orient='records')
    temperature_data = hourly_data[['time', 'temp']].dropna().to_dict(orient='records')
    co2_data = hourly_data[['time', 'co2conc']].dropna().to_dict(orient='records')
    
    return humidity_data, temperature_data, co2_data

@app.route('/')
def home():
    return "Flask App is Running"

@app.route('/data', methods=['GET'])
def get_data():
    global flag_ac
    imei = request.args.get('imei')
    outdoor_imei = request.args.get('outdoor_imei')
    guideline = request.args.get('guideline')
    if not imei or not outdoor_imei:
        return jsonify({"error": "Both indoor and outdoor IMEIs are required"}), 400

    start_date = (datetime.now() - timedelta(hours=1)).strftime('%Y-%m-%dT%H:%M')
    just_prev_date = (datetime.now() - timedelta(minutes=2)).strftime('%Y-%m-%dT%H:%M')
    prev_day_start = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%dT%H:%M')
    prev_day_end = (datetime.now() - timedelta(minutes=2)).strftime('%Y-%m-%dT%H:%M')

    try:
        df_outdoor = fetch_data_with_retry(f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/{outdoor_imei}/params/pm2.5cnc,pm10cnc,co2conc,pres,temp,humidity,vocconc/'
                                           + f'startdate/{start_date}/enddate/{just_prev_date}/'
                                           + f'ts/mm/avg/1/api/mm8IZ3MGrj?gaps=1&gap_value=NULL')
        df_indoor = fetch_data_with_retry(f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/{imei}/params/pm2.5cnc,pm10cnc,co2conc,pres,temp,humidity,vocconc/'
                                          + f'startdate/{start_date}/enddate/{just_prev_date}/'
                                          + f'ts/mm/avg/1/api/mm8IZ3MGrj?gaps=1&gap_value=NULL')
        df_prev_day = fetch_data_with_retry(f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/{imei}/params/co2conc/'
                                            + f'startdate/{prev_day_start}/enddate/{prev_day_end}/'
                                            + f'ts/mm/avg/1/api/mm8IZ3MGrj?gaps=1&gap_value=NULL')

        df_indoor["dt_time"] = pd.to_datetime(df_indoor["dt_time"])
        df_indoor.set_index("dt_time", inplace=True, drop=True)
        df_prev_day["dt_time"] = pd.to_datetime(df_prev_day["dt_time"])
        df_prev_day.set_index("dt_time", inplace=True, drop=True)

        date_obj = datetime.strptime(just_prev_date, "%Y-%m-%dT%H:%M")
        formatted_date_str = date_obj.strftime("%d %b %Y %H:%M:%S")

        last_valid_index_temp_outdoor = df_outdoor["temp"].last_valid_index()
        temp_outdoor = df_outdoor.loc[last_valid_index_temp_outdoor, "temp"]

        last_valid_index_temp_indoor = df_indoor["temp"].last_valid_index()
        temp_indoor = df_indoor.loc[last_valid_index_temp_indoor, "temp"]

        last_valid_index_voc_outdoor = df_outdoor["vocconc"].last_valid_index()
        voc_outdoor = df_outdoor.loc[last_valid_index_voc_outdoor, "vocconc"]

        last_valid_index_co2_outdoor = df_outdoor["co2conc"].last_valid_index()
        co2_outdoor = df_outdoor.loc[last_valid_index_co2_outdoor, "co2conc"]

        last_valid_index_co2_indoor = df_indoor["co2conc"].last_valid_index()
        co2_indoor = df_indoor.loc[last_valid_index_co2_indoor, "co2conc"]

        last_valid_index_pm25_outdoor = df_outdoor["pm2.5cnc"].last_valid_index()
        pm25_outdoor = df_outdoor.loc[last_valid_index_pm25_outdoor, "pm2.5cnc"]

        last_valid_index_pm25_indoor = df_indoor["pm2.5cnc"].last_valid_index()
        pm25_indoor = df_indoor.loc[last_valid_index_pm25_indoor, "pm2.5cnc"]
        
        last_valid_index_humidity = df_indoor["humidity"].last_valid_index()
        humidity = df_indoor.loc[last_valid_index_humidity, "humidity"]

        df_prev_day["co2conc"] = pd.to_numeric(df_prev_day["co2conc"], errors='coerce')
        df_prev_day = df_prev_day.dropna(subset=['co2conc'])
        df_prev_day = df_prev_day.resample('h').mean(numeric_only=True)
        df_prev_day = round(df_prev_day, 1)
        
        co2_prev_day = df_prev_day["co2conc"].tolist()
        timestamps_prev_day = df_prev_day.index.strftime('%Y-%m-%dT%H:%M:%S').tolist()
        co2_prev_day_data = [{"time": t, "co2": c} for t, c in zip(timestamps_prev_day, co2_prev_day)]

        df_indoor["hour"] = df_indoor.index.hour
        df_indoor["day"] = df_indoor.index.date
        df_indoor["minutes"] = df_indoor.index.minute
        grouped = df_indoor.groupby(['day', 'hour'])

        m_value = None
        for (day, hour), group in grouped:
            group = group.dropna(subset=['co2conc'])
            X = group[['minutes']]
            y = group['co2conc']
            try:
                model = LinearRegression()
                model.fit(X, y)
                m = model.coef_[0]
            except ValueError as e:
                print(f"Error encountered: {e}")
                m = np.nan
            m_value = m

        
        indoor_temp_req = 0.078 * temp_outdoor + 23.25
        indoor_temp_low_lim = indoor_temp_req - 1.5
        indoor_temp_high_lim = indoor_temp_req + 1.5

        temp_advice = None
        if indoor_temp_low_lim <= temp_indoor <= indoor_temp_high_lim:
            temp_advice = "Thermal comfort is within the range. Open windows."
        elif temp_indoor > indoor_temp_high_lim:
            temp_advice = f"Temperature is {round(temp_indoor, 1)} which is above thermal comfort, please keep AC setpoint 23ºC."
        elif temp_indoor < indoor_temp_low_lim:
            temp_advice = f"Temperature is {round(temp_indoor, 1)} which is below thermal comfort, please keep AC setpoint 26ºC."

        # if voc_indoor >= 100:
        #     flag_ac = False
        #     temp_advice = "VOC level is high, please ventilate the room and turn ON AC for fresh air."
        # elif voc_indoor < 100 and not flag_ac:
        #     flag_ac = True
        #     temp_advice = "VOC levels are low, turn OFF AC and open windows."
        # if temp_outdoor > 33 and flag_ac:
        #     temp_advice = "The temperature is above comfort zone, keep windows closed and turn ON AC with setpoint 26ºC to conserve energy."
        
        co2_advice = None
        co2_threshold = 1000
        ACH = m_value
        volume_of_room = 150
        if co2_indoor > co2_threshold:
            q = (volume_of_room * ACH * (co2_indoor - co2_outdoor)) / (co2_outdoor * 60)
            count_of_windows = 5
            total_window_area = 10
            velocity = 0.1 if abs(ACH) < 1 else 0.2 if abs(ACH) < 4 else 0.3
            area_window = q / (60 * velocity * count_of_windows)
            area_of_1_window = total_window_area / count_of_windows
            req_windows = area_window / area_of_1_window
            if req_windows < 1:
                co2_advice = "Indoor CO2 level is high, please open 1 window."
            elif req_windows > 1 and req_windows < count_of_windows:
                co2_advice = f"Indoor CO2 level is high, please open {math.ceil(req_windows)} windows."
            else:
                co2_advice = "Indoor CO2 level is high, please open all windows."

        aqi_advice = None

        if 23 < temp_outdoor < 27:
            if 30 < humidity < 70:
                aqi_advice = "Ambient air is favourable, open windows."

        I_humidity_data, I_temperature_data, I_co2_data= get_historical_hourly_data(imei, 'mm8IZ3MGrj')
        O_humidity_data, O_temperature_data, O_co2_data = get_historical_hourly_data(outdoor_imei, 'mm8IZ3MGrj')
        
        wellness_index = calculate_wellness_index(temp_indoor, humidity, pm25_indoor, co2_indoor, m_value, voc_outdoor, guideline)
        iew_temp = calculate_iew_temperature(temp_indoor, 25)
        iew_humidity = calculate_iew_humidity(humidity)
        iew_pm25 = calculate_iew_pm25(pm25_indoor)
        iew_co2 = calculate_iew_co2(co2_indoor)
        iew_ach = calculate_iew_ach(m_value)  
        iew_tvoc = calculate_iew_tvoc(voc_outdoor)
        
        
        
        response = {
            "timestamp": formatted_date_str,
            "outdoor_temperature": round(temp_outdoor, 1),
            "indoor_temperature": round(temp_indoor, 1),
            "outdoor_co2": round(co2_outdoor, 1),
            "indoor_co2": round(co2_indoor, 1),
            "outdoor_pm25": round(pm25_outdoor, 1),
            "indoor_pm25": round(pm25_indoor, 1),
            "humidity": round(humidity, 1),
            "tvoc": round(voc_outdoor, 1),
            "wellness_index": round(wellness_index, 1),
            "iew_temp": round(iew_temp,1),
            "iew_humidity": round(iew_humidity,1),
            "iew_pm25": round(iew_pm25,1),
            "iew_co2": round(iew_co2,1),
            "iew_ach": round(iew_ach,1),
            "iew_tvoc": round(iew_tvoc,1),
            "ach": m_value,
            "temp_advice": temp_advice,
            "co2_advice": co2_advice,
            "co2_prev_day": co2_prev_day_data,
            "aqi_advice": aqi_advice,
            "historical_humidity_indoor": I_humidity_data,
            "historical_temperature_indoor": I_temperature_data,
            "historical_co2_indoor": I_co2_data,
            "historical_humidity_outdoor": O_humidity_data,
            "historical_temperature_outdoor": O_temperature_data
        }

        return jsonify(response)
    except Exception as e:
        app.logger.error(f"Server error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
'''
from flask import Flask, jsonify, request
import math
import pandas as pd
import numpy as np
from datetime import timedelta, datetime
import time
from sklearn.linear_model import LinearRegression
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

flag_ac = True

def fetch_data_with_retry(url, retries=15, delay=1):
    for attempt in range(retries):
        try:
            df = pd.read_csv(url)
            if df.empty:
                print(url)
                raise ValueError("DataFrame is empty")
            if attempt > 0:
                print(f"Data fetched successfully on attempt {attempt + 1}")
            return df
        except ValueError as ve:
            print(f"Attempt {attempt + 1} failed due to empty DataFrame. Error: {ve}")
            if attempt < retries - 1:
                print("Retrying...")
                time.sleep(delay)
        except Exception as e:
            print(f"Attempt {attempt + 1} failed. Error: {e}")
            if attempt < retries - 1:
                print("Retrying...")
                time.sleep(delay)
    raise RuntimeError(f"Failed after {retries} attempts")

def get_historical_hourly_data(imei, data_type):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=5)
    
    start_date_str = start_date.strftime('%Y-%m-%dT%H:%M')
    end_date_str = end_date.strftime('%Y-%m-%dT%H:%M')
    
    url = (f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/{imei}/params/temp,humidity,co2conc/'
          +f'startdate/{start_date_str}/enddate/{end_date_str}/'
          +f'ts/hh/avg/1/api/{data_type}?gaps=1&gap_value=NULL')
    
    df = fetch_data_with_retry(url)
    
    df["dt_time"] = pd.to_datetime(df["dt_time"])
    df.set_index("dt_time", inplace=True, drop=True)
    
    hourly_data = df.resample('h').mean(numeric_only=True)

    hourly_data = hourly_data.reset_index()
    hourly_data = round(hourly_data, 1)
    hourly_data['time'] = hourly_data['dt_time'].dt.strftime('%Y-%m-%dT%H:%M')
    humidity_data = hourly_data[['time', 'humidity']].dropna().to_dict(orient='records')
    temperature_data = hourly_data[['time', 'temp']].dropna().to_dict(orient='records')
    co2_data = hourly_data[['time', 'co2conc']].dropna().to_dict(orient='records')
    
    return humidity_data, temperature_data, co2_data

@app.route('/')
def home():
    return "Flask App is Running"

@app.route('/data', methods=['GET'])
def get_data():
    global flag_ac
    imei = request.args.get('imei')
    outdoor_imei = request.args.get('outdoor_imei')
    if not imei or not outdoor_imei:
        return jsonify({"error": "Both indoor and outdoor IMEIs are required"}), 400

    start_date = (datetime.now() - timedelta(hours=1)).strftime('%Y-%m-%dT%H:%M')
    just_prev_date = (datetime.now() - timedelta(minutes=2)).strftime('%Y-%m-%dT%H:%M')
    prev_day_start = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%dT%H:%M')
    prev_day_end = (datetime.now() - timedelta(minutes=2)).strftime('%Y-%m-%dT%H:%M')

    try:
        df_outdoor = fetch_data_with_retry(f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/{outdoor_imei}/params/pm2.5cnc,pm10cnc,co2conc,pres,temp,humidity,vocconc/'
                                           + f'startdate/{start_date}/enddate/{just_prev_date}/'
                                           + f'ts/mm/avg/1/api/mm8IZ3MGrj?gaps=1&gap_value=NULL')
        df_indoor = fetch_data_with_retry(f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/{imei}/params/pm2.5cnc,pm10cnc,co2conc,pres,temp,humidity,vocconc/'
                                          + f'startdate/{start_date}/enddate/{just_prev_date}/'
                                          + f'ts/mm/avg/1/api/mm8IZ3MGrj?gaps=1&gap_value=NULL')
        df_prev_day = fetch_data_with_retry(f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/{imei}/params/co2conc/'
                                            + f'startdate/{prev_day_start}/enddate/{prev_day_end}/'
                                            + f'ts/mm/avg/1/api/mm8IZ3MGrj?gaps=1&gap_value=NULL')

        df_indoor["dt_time"] = pd.to_datetime(df_indoor["dt_time"])
        df_indoor.set_index("dt_time", inplace=True, drop=True)
        df_prev_day["dt_time"] = pd.to_datetime(df_prev_day["dt_time"])
        df_prev_day.set_index("dt_time", inplace=True, drop=True)

        date_obj = datetime.strptime(just_prev_date, "%Y-%m-%dT%H:%M")
        formatted_date_str = date_obj.strftime("%d %b %Y %H:%M:%S")

        last_valid_index_temp_outdoor = df_outdoor["temp"].last_valid_index()
        temp_outdoor = df_outdoor.loc[last_valid_index_temp_outdoor, "temp"]

        last_valid_index_temp_indoor = df_indoor["temp"].last_valid_index()
        temp_indoor = df_indoor.loc[last_valid_index_temp_indoor, "temp"]

        last_valid_index_voc_outdoor = df_outdoor["vocconc"].last_valid_index()
        voc_outdoor = df_outdoor.loc[last_valid_index_voc_outdoor, "vocconc"]

        last_valid_index_co2_outdoor = df_outdoor["co2conc"].last_valid_index()
        co2_outdoor = df_outdoor.loc[last_valid_index_co2_outdoor, "co2conc"]

        last_valid_index_co2_indoor = df_indoor["co2conc"].last_valid_index()
        co2_indoor = df_indoor.loc[last_valid_index_co2_indoor, "co2conc"]

        last_valid_index_pm25_outdoor = df_outdoor["pm2.5cnc"].last_valid_index()
        pm25_outdoor = df_outdoor.loc[last_valid_index_pm25_outdoor, "pm2.5cnc"]

        last_valid_index_pm25_indoor = df_indoor["pm2.5cnc"].last_valid_index()
        pm25_indoor = df_indoor.loc[last_valid_index_pm25_indoor, "pm2.5cnc"]
        
        last_valid_index_humidity = df_indoor["humidity"].last_valid_index()
        humidity = df_indoor.loc[last_valid_index_humidity, "humidity"]

        df_prev_day["co2conc"] = pd.to_numeric(df_prev_day["co2conc"], errors='coerce')
        df_prev_day = df_prev_day.dropna(subset=['co2conc'])
        df_prev_day = df_prev_day.resample('h').mean(numeric_only=True)
        df_prev_day = round(df_prev_day, 1)
        
        co2_prev_day = df_prev_day["co2conc"].tolist()
        timestamps_prev_day = df_prev_day.index.strftime('%Y-%m-%dT%H:%M:%S').tolist()
        co2_prev_day_data = [{"time": t, "co2": c} for t, c in zip(timestamps_prev_day, co2_prev_day)]

        df_indoor["hour"] = df_indoor.index.hour
        df_indoor["day"] = df_indoor.index.date
        df_indoor["minutes"] = df_indoor.index.minute
        grouped = df_indoor.groupby(['day', 'hour'])

        m_value = None
        for (day, hour), group in grouped:
            group = group.dropna(subset=['co2conc'])
            X = group[['minutes']]
            y = group['co2conc']
            try:
                model = LinearRegression()
                model.fit(X, y)
                m = model.coef_[0]
            except ValueError as e:
                print(f"Error encountered: {e}")
                m = np.nan
            m_value = m

        
        indoor_temp_req = 0.078 * temp_outdoor + 23.25
        indoor_temp_low_lim = indoor_temp_req - 1.5
        indoor_temp_high_lim = indoor_temp_req + 1.5

        temp_advice = None
        if indoor_temp_low_lim <= temp_indoor <= indoor_temp_high_lim:
            temp_advice = "Thermal comfort is within the range. Open windows."
        elif temp_indoor > indoor_temp_high_lim:
            temp_advice = f"Temperature is {round(temp_indoor, 1)} which is above thermal comfort, please keep AC setpoint 23ºC."
        elif temp_indoor < indoor_temp_low_lim:
            temp_advice = f"Temperature is {round(temp_indoor, 1)} which is below thermal comfort, please keep AC setpoint 26ºC."

        # if voc_indoor >= 100:
        #     flag_ac = False
        #     temp_advice = "VOC level is high, please ventilate the room and turn ON AC for fresh air."
        # elif voc_indoor < 100 and not flag_ac:
        #     flag_ac = True
        #     temp_advice = "VOC levels are low, turn OFF AC and open windows."
        # if temp_outdoor > 33 and flag_ac:
        #     temp_advice = "The temperature is above comfort zone, keep windows closed and turn ON AC with setpoint 26ºC to conserve energy."
        
        co2_advice = None
        co2_threshold = 1000
        ACH = m_value
        volume_of_room = 150
        if co2_indoor > co2_threshold:
            q = (volume_of_room * ACH * (co2_indoor - co2_outdoor)) / (co2_outdoor * 60)
            count_of_windows = 5
            total_window_area = 10
            velocity = 0.1 if abs(ACH) < 1 else 0.2 if abs(ACH) < 4 else 0.3
            area_window = q / (60 * velocity * count_of_windows)
            area_of_1_window = total_window_area / count_of_windows
            req_windows = area_window / area_of_1_window
            if req_windows < 1:
                co2_advice = "Indoor CO2 level is high, please open 1 window."
            elif req_windows > 1 and req_windows < count_of_windows:
                co2_advice = f"Indoor CO2 level is high, please open {math.ceil(req_windows)} windows."
            else:
                co2_advice = "Indoor CO2 level is high, please open all windows."

        aqi_advice = None

        if 23 < temp_outdoor < 27:
            if 30 < humidity < 70:
                aqi_advice = "Ambient air is favourable, open windows."

        I_humidity_data, I_temperature_data, I_co2_data= get_historical_hourly_data(imei, 'mm8IZ3MGrj')
        O_humidity_data, O_temperature_data, O_co2_data = get_historical_hourly_data(outdoor_imei, 'mm8IZ3MGrj')
        
        
        response = {
            "timestamp": formatted_date_str,
            "outdoor_temperature": round(temp_outdoor, 1),
            "indoor_temperature": round(temp_indoor, 1),
            "outdoor_co2": round(co2_outdoor, 1),
            "indoor_co2": round(co2_indoor, 1),
            "outdoor_pm25": round(pm25_outdoor, 1),
            "indoor_pm25": round(pm25_indoor, 1),
            "humidity": round(humidity, 1),
            "tvoc": round(voc_outdoor, 1),
            "temp_advice": temp_advice,
            "co2_advice": co2_advice,
            "co2_prev_day": co2_prev_day_data,
            "aqi_advice": aqi_advice,
            "historical_humidity_indoor": I_humidity_data,
            "historical_temperature_indoor": I_temperature_data,
            "historical_co2_indoor": I_co2_data,
            "historical_humidity_outdoor": O_humidity_data,
            "historical_temperature_outdoor": O_temperature_data
        }

        return jsonify(response)
    except Exception as e:
        app.logger.error(f"Server error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)

'''

'''
from flask import Flask, jsonify, request
import math
import pandas as pd
import numpy as np
from datetime import timedelta, datetime
import time
from sklearn.linear_model import LinearRegression
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

flag_ac = True

def fetch_data_with_retry(url, retries=15, delay=1):
    for attempt in range(retries):
        try:
            df = pd.read_csv(url)
            if df.empty:
                print(url)
                raise ValueError("DataFrame is empty")
            if attempt > 0:
                print(f"Data fetched successfully on attempt {attempt + 1}")
            return df
        except ValueError as ve:
            print(f"Attempt {attempt + 1} failed due to empty DataFrame. Error: {ve}")
            if attempt < retries - 1:
                print("Retrying...")
                time.sleep(delay)
        except Exception as e:
            print(f"Attempt {attempt + 1} failed. Error: {e}")
            if attempt < retries - 1:
                print("Retrying...")
                time.sleep(delay)
    raise RuntimeError(f"Failed after {retries} attempts")

def get_historical_hourly_data(imei, data_type):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=5)
    
    start_date_str = start_date.strftime('%Y-%m-%dT%H:%M')
    end_date_str = end_date.strftime('%Y-%m-%dT%H:%M')
    
    url = (f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/{imei}/params/temp,humidity/'
          +f'startdate/{start_date_str}/enddate/{end_date_str}/'
          +f'ts/hh/avg/1/api/{data_type}?gaps=1&gap_value=NULL')
    
    df = fetch_data_with_retry(url)
    
    df["dt_time"] = pd.to_datetime(df["dt_time"])
    df.set_index("dt_time", inplace=True, drop=True)
    
    hourly_data = df.resample('h').mean(numeric_only=True)

    hourly_data = hourly_data.reset_index()
    hourly_data = round(hourly_data, 1)
    hourly_data['time'] = hourly_data['dt_time'].dt.strftime('%Y-%m-%dT%H:%M')
    humidity_data = hourly_data[['time', 'humidity']].dropna().to_dict(orient='records')
    temperature_data = hourly_data[['time', 'temp']].dropna().to_dict(orient='records')
    
    return humidity_data, temperature_data

@app.route('/')
def home():
    return "Flask App is Running"

@app.route('/data', methods=['GET'])
def get_data():
    global flag_ac
    imei = request.args.get('imei')
    outdoor_imei = request.args.get('outdoor_imei')
    if not imei or not outdoor_imei:
        return jsonify({"error": "Both indoor and outdoor IMEIs are required"}), 400

    start_date = (datetime.now() - timedelta(hours=1)).strftime('%Y-%m-%dT%H:%M')
    just_prev_date = (datetime.now() - timedelta(minutes=2)).strftime('%Y-%m-%dT%H:%M')
    prev_day_start = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%dT%H:%M')
    prev_day_end = (datetime.now() - timedelta(minutes=2)).strftime('%Y-%m-%dT%H:%M')

    try:
        df_outdoor = fetch_data_with_retry(f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/{outdoor_imei}/params/pm2.5cnc,pm10cnc,co2conc,pres,temp,humidity,vocconc/'
                                           + f'startdate/{start_date}/enddate/{just_prev_date}/'
                                           + f'ts/mm/avg/1/api/qc_airview?gaps=1&gap_value=NULL')
        df_indoor = fetch_data_with_retry(f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/{imei}/params/pm2.5cnc,pm10cnc,co2conc,pres,temp,humidity,vocconc/'
                                          + f'startdate/{start_date}/enddate/{just_prev_date}/'
                                          + f'ts/mm/avg/1/api/mm8IZ3MGrj?gaps=1&gap_value=NULL')
        df_prev_day = fetch_data_with_retry(f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/{imei}/params/co2conc/'
                                            + f'startdate/{prev_day_start}/enddate/{prev_day_end}/'
                                            + f'ts/mm/avg/1/api/mm8IZ3MGrj?gaps=1&gap_value=NULL')

        df_indoor["dt_time"] = pd.to_datetime(df_indoor["dt_time"])
        df_indoor.set_index("dt_time", inplace=True, drop=True)
        df_prev_day["dt_time"] = pd.to_datetime(df_prev_day["dt_time"])
        df_prev_day.set_index("dt_time", inplace=True, drop=True)

        date_obj = datetime.strptime(just_prev_date, "%Y-%m-%dT%H:%M")
        formatted_date_str = date_obj.strftime("%d %b %Y %H:%M:%S")

        last_valid_index_temp_outdoor = df_outdoor["temp"].last_valid_index()
        temp_outdoor = df_outdoor.loc[last_valid_index_temp_outdoor, "temp"]

        last_valid_index_temp_indoor = df_indoor["temp"].last_valid_index()
        temp_indoor = df_indoor.loc[last_valid_index_temp_indoor, "temp"]

        last_valid_index_voc_indoor = df_indoor["vocconc"].last_valid_index()
        voc_indoor = df_indoor.loc[last_valid_index_temp_indoor, "vocconc"]

        last_valid_index_co2_outdoor = df_outdoor["co2conc"].last_valid_index()
        co2_outdoor = df_outdoor.loc[last_valid_index_co2_outdoor, "co2conc"]

        last_valid_index_co2_indoor = df_indoor["co2conc"].last_valid_index()
        co2_indoor = df_indoor.loc[last_valid_index_co2_indoor, "co2conc"]

        last_valid_index_pm25_outdoor = df_outdoor["pm2.5cnc"].last_valid_index()
        pm25_outdoor = df_outdoor.loc[last_valid_index_pm25_outdoor, "pm2.5cnc"]

        last_valid_index_pm25_indoor = df_indoor["pm2.5cnc"].last_valid_index()
        pm25_indoor = df_indoor.loc[last_valid_index_pm25_indoor, "pm2.5cnc"]
        
        last_valid_index_humidity = df_indoor["humidity"].last_valid_index()
        humidity = df_indoor.loc[last_valid_index_humidity, "humidity"]

        df_prev_day["co2conc"] = pd.to_numeric(df_prev_day["co2conc"], errors='coerce')
        df_prev_day = df_prev_day.dropna(subset=['co2conc'])
        df_prev_day = df_prev_day.resample('h').mean(numeric_only=True)
        df_prev_day = round(df_prev_day, 1)
        
        co2_prev_day = df_prev_day["co2conc"].tolist()
        timestamps_prev_day = df_prev_day.index.strftime('%Y-%m-%dT%H:%M:%S').tolist()
        co2_prev_day_data = [{"time": t, "co2": c} for t, c in zip(timestamps_prev_day, co2_prev_day)]

        df_indoor["hour"] = df_indoor.index.hour
        df_indoor["day"] = df_indoor.index.date
        df_indoor["minutes"] = df_indoor.index.minute
        grouped = df_indoor.groupby(['day', 'hour'])

        m_value = None
        for (day, hour), group in grouped:
            group = group.dropna(subset=['co2conc'])
            X = group[['minutes']]
            y = group['co2conc']
            try:
                model = LinearRegression()
                model.fit(X, y)
                m = model.coef_[0]
            except ValueError as e:
                print(f"Error encountered: {e}")
                m = np.nan
            m_value = m

        
        indoor_temp_req = 0.078 * temp_outdoor + 23.25
        indoor_temp_low_lim = indoor_temp_req - 1.5
        indoor_temp_high_lim = indoor_temp_req + 1.5

        temp_advice = None
        if indoor_temp_low_lim <= temp_indoor <= indoor_temp_high_lim:
            temp_advice = "Thermal comfort is within the range. Open windows."
        elif temp_indoor > indoor_temp_high_lim:
            temp_advice = f"Temperature is {round(temp_indoor, 1)} which is above thermal comfort, please keep AC setpoint 23ºC."
        elif temp_indoor < indoor_temp_low_lim:
            temp_advice = f"Temperature is {round(temp_indoor, 1)} which is below thermal comfort, please keep AC setpoint 26ºC."

        if voc_indoor >= 100:
            flag_ac = False
            temp_advice = "VOC level is high, please ventilate the room and turn ON AC for fresh air."
        elif voc_indoor < 100 and not flag_ac:
            flag_ac = True
            temp_advice = "VOC levels are low, turn OFF AC and open windows."
        if temp_outdoor > 33 and flag_ac:
            temp_advice = "The temperature is above comfort zone, keep windows closed and turn ON AC with setpoint 26ºC to conserve energy."
        
        co2_advice = None
        co2_threshold = 1000
        ACH = m_value
        volume_of_room = 150
        if co2_indoor > co2_threshold:
            q = (volume_of_room * ACH * (co2_indoor - co2_outdoor)) / (co2_outdoor * 60)
            count_of_windows = 5
            total_window_area = 10
            velocity = 0.1 if abs(ACH) < 1 else 0.2 if abs(ACH) < 4 else 0.3
            area_window = q / (60 * velocity * count_of_windows)
            area_of_1_window = total_window_area / count_of_windows
            req_windows = area_window / area_of_1_window
            if req_windows < 1:
                co2_advice = "Indoor CO2 level is high, please open 1 window."
            elif req_windows > 1 and req_windows < count_of_windows:
                co2_advice = f"Indoor CO2 level is high, please open {math.ceil(req_windows)} windows."
            else:
                co2_advice = "Indoor CO2 level is high, please open all windows."

        aqi_advice = None

        if 23 < temp_outdoor < 27:
            if 30 < humidity < 70:
                aqi_advice = "Ambient air is favourable, open windows."

        I_humidity_data, I_temperature_data = get_historical_hourly_data(imei, 'mm8IZ3MGrj')
        O_humidity_data, O_temperature_data = get_historical_hourly_data(outdoor_imei, 'qc_airview')
        
        response = {
            "timestamp": formatted_date_str,
            "outdoor_temperature": round(temp_outdoor, 1),
            "indoor_temperature": round(temp_indoor, 1),
            "outdoor_co2": round(co2_outdoor, 1),
            "indoor_co2": round(co2_indoor, 1),
            "outdoor_pm25": round(pm25_outdoor, 1),
            "indoor_pm25": round(pm25_indoor, 1),
            "humidity": round(humidity, 1),
            "temp_advice": temp_advice,
            "co2_advice": co2_advice,
            "co2_prev_day": co2_prev_day_data,
            "aqi_advice": aqi_advice,
            "historical_humidity_indoor": I_humidity_data,
            "historical_temperature_indoor": I_temperature_data,
            "historical_humidity_outdoor": O_humidity_data,
            "historical_temperature_outdoor": O_temperature_data
        }

        return jsonify(response)
    except Exception as e:
        app.logger.error(f"Server error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)


#s1SFoBxhm7 old api key
from flask import Flask, jsonify, request
import math
import pandas as pd
import numpy as np
from datetime import timedelta, datetime
import time
from sklearn.linear_model import LinearRegression
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

flag_ac = True

def fetch_data_with_retry(url, retries=15, delay=1):
    for attempt in range(retries):
        try:
            df = pd.read_csv(url)
            if df.empty:
                print(url)
                raise ValueError("DataFrame is empty")
            if attempt > 0:
                print(f"Data fetched successfully on attempt {attempt + 1}")
            return df
        except ValueError as ve:
            print(f"Attempt {attempt + 1} failed due to empty DataFrame. Error: {ve}")
            if attempt < retries - 1:
                print("Retrying...")
                time.sleep(delay)
        except Exception as e:
            print(f"Attempt {attempt + 1} failed. Error: {e}")
            if attempt < retries - 1:
                print("Retrying...")
                time.sleep(delay)
    raise RuntimeError(f"Failed after {retries} attempts")

def get_historical_hourly_data_indoor(imei):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=5)
    
    start_date_str = start_date.strftime('%Y-%m-%dT%H:%M')
    end_date_str = end_date.strftime('%Y-%m-%dT%H:%M')
    
    df = fetch_data_with_retry(
        f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/{imei}/params/temp,humidity/'
        + f'startdate/{start_date_str}/enddate/{end_date_str}/'
        + f'ts/hh/avg/1/api/mm8IZ3MGrj?gaps=1&gap_value=NULL'
    )
    
    df["dt_time"] = pd.to_datetime(df["dt_time"])
    df.set_index("dt_time", inplace=True, drop=True)
    
    hourly_data = df.resample('h').mean(numeric_only=True)

    hourly_data = hourly_data.reset_index()
    hourly_data = round(hourly_data, 1)
    hourly_data['time'] = hourly_data['dt_time'].dt.strftime('%Y-%m-%dT%H:%M')
    humidity_data = hourly_data[['time', 'humidity']].dropna().to_dict(orient='records')
    temperature_data = hourly_data[['time', 'temp']].dropna().to_dict(orient='records')
    
    return humidity_data, temperature_data

def get_historical_hourly_data_outdoor():
    end_date = datetime.now()
    start_date = end_date - timedelta(days=5)
    
    start_date_str = start_date.strftime('%Y-%m-%dT%H:%M')
    end_date_str = end_date.strftime('%Y-%m-%dT%H:%M')
    
    df = fetch_data_with_retry(
        f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/500291EC2742/params/temp,humidity/'
        + f'startdate/{start_date_str}/enddate/{end_date_str}/'
        + f'ts/mm/avg/1/api/qc_airview?gaps=1&gap_value=NULL'
    )
    
    df["dt_time"] = pd.to_datetime(df["dt_time"])
    df.set_index("dt_time", inplace=True, drop=True)
    
    hourly_data = df.resample('h').mean(numeric_only=True)

    hourly_data = hourly_data.reset_index()
    hourly_data = round(hourly_data, 1)
    hourly_data['time'] = hourly_data['dt_time'].dt.strftime('%Y-%m-%dT%H:%M')
    humidity_data = hourly_data[['time', 'humidity']].dropna().to_dict(orient='records')
    temperature_data = hourly_data[['time', 'temp']].dropna().to_dict(orient='records')
    
    return humidity_data, temperature_data

@app.route('/')
def home():
    return "Flask App is Running"

@app.route('/data', methods=['GET'])
def get_data():
    global flag_ac
    imei = request.args.get('imei')
    if not imei:
        return jsonify({"error": "IMEI is required"}), 400

    start_date = (datetime.now() - timedelta(hours=1)).strftime('%Y-%m-%dT%H:%M')
    just_prev_date = (datetime.now() - timedelta(minutes=2)).strftime('%Y-%m-%dT%H:%M')
    prev_day_start = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%dT%H:%M')
    prev_day_end = (datetime.now() - timedelta(minutes=2)).strftime('%Y-%m-%dT%H:%M')

    try:
        df_outdoor = fetch_data_with_retry(f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/500291EC2742/params/pm2.5cnc,pm10cnc,co2conc,pres,temp,humidity,vocconc/'
                                           + f'startdate/{start_date}/enddate/{just_prev_date}/'
                                           + f'ts/mm/avg/1/api/qc_airview?gaps=1&gap_value=NULL')
        df_indoor = fetch_data_with_retry(f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/{imei}/params/pm2.5cnc,pm10cnc,co2conc,pres,temp,humidity,vocconc/'
                                          + f'startdate/{start_date}/enddate/{just_prev_date}/'
                                          + f'ts/mm/avg/1/api/mm8IZ3MGrj?gaps=1&gap_value=NULL')
        df_prev_day = fetch_data_with_retry(f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/{imei}/params/co2conc/'
                                            + f'startdate/{prev_day_start}/enddate/{prev_day_end}/'
                                            + f'ts/mm/avg/1/api/mm8IZ3MGrj?gaps=1&gap_value=NULL')

        df_indoor["dt_time"] = pd.to_datetime(df_indoor["dt_time"])
        df_indoor.set_index("dt_time", inplace=True, drop=True)
        df_prev_day["dt_time"] = pd.to_datetime(df_prev_day["dt_time"])
        df_prev_day.set_index("dt_time", inplace=True, drop=True)

        date_obj = datetime.strptime(just_prev_date, "%Y-%m-%dT%H:%M")
        formatted_date_str = date_obj.strftime("%d %b %Y %H:%M:%S")

        last_valid_index_temp_outdoor = df_outdoor["temp"].last_valid_index()
        temp_outdoor = df_outdoor.loc[last_valid_index_temp_outdoor, "temp"]

        last_valid_index_temp_indoor = df_indoor["temp"].last_valid_index()
        temp_indoor = df_indoor.loc[last_valid_index_temp_indoor, "temp"]

        last_valid_index_voc_indoor = df_indoor["vocconc"].last_valid_index()
        voc_indoor = df_indoor.loc[last_valid_index_temp_indoor, "vocconc"]

        last_valid_index_co2_outdoor = df_outdoor["co2conc"].last_valid_index()
        co2_outdoor = df_outdoor.loc[last_valid_index_co2_outdoor, "co2conc"]

        last_valid_index_co2_indoor = df_indoor["co2conc"].last_valid_index()
        co2_indoor = df_indoor.loc[last_valid_index_co2_indoor, "co2conc"]

        last_valid_index_pm25_outdoor = df_outdoor["pm2.5cnc"].last_valid_index()
        pm25_outdoor = df_outdoor.loc[last_valid_index_pm25_outdoor, "pm2.5cnc"]

        last_valid_index_pm25_indoor = df_indoor["pm2.5cnc"].last_valid_index()
        pm25_indoor = df_indoor.loc[last_valid_index_pm25_indoor, "pm2.5cnc"]
        
        last_valid_index_humidity = df_indoor["humidity"].last_valid_index()
        humidity = df_indoor.loc[last_valid_index_humidity, "humidity"]

        df_prev_day["co2conc"] = pd.to_numeric(df_prev_day["co2conc"], errors='coerce')
        df_prev_day = df_prev_day.dropna(subset=['co2conc'])
        df_prev_day = df_prev_day.resample('h').mean(numeric_only = True)
        df_prev_day = round(df_prev_day, 1)
        
        co2_prev_day = df_prev_day["co2conc"].tolist()
        timestamps_prev_day = df_prev_day.index.strftime('%Y-%m-%dT%H:%M:%S').tolist()
        co2_prev_day_data = [{"time": t, "co2": c} for t, c in zip(timestamps_prev_day, co2_prev_day)]

        df_indoor["hour"] = df_indoor.index.hour
        df_indoor["day"] = df_indoor.index.date
        df_indoor["minutes"] = df_indoor.index.minute
        grouped = df_indoor.groupby(['day', 'hour'])

        m_value = None
        for (day, hour), group in grouped:
            group = group.dropna(subset=['co2conc'])
            X = group[['minutes']]
            y = group['co2conc']
            try:
                model = LinearRegression()
                model.fit(X, y)
                m = model.coef_[0]
            except ValueError as e:
                print(f"Error encountered: {e}")
                m = np.nan
            m_value = m

        
        indoor_temp_req = 0.078 * temp_outdoor + 23.25
        indoor_temp_low_lim = indoor_temp_req - 1.5
        indoor_temp_high_lim = indoor_temp_req + 1.5

        temp_advice = None
        if indoor_temp_low_lim < temp_outdoor < indoor_temp_high_lim:
            temp_advice = "Outdoor temperature is in thermal comfort zone, please turn OFF AC and open all windows."
        elif temp_indoor > indoor_temp_high_lim:
            temp_advice = f"Temperature is {round(temp_indoor, 1)} which is above thermal comfort, please keep AC setpoint 23ºC."
        elif temp_indoor < indoor_temp_low_lim and flag_ac:
            temp_advice = f"Temperature is {round(temp_indoor, 1)} which is below thermal comfort, please consider turning OFF Air Conditioner OR Increase AC setpoint to 26ºC to conserve energy."

        co2_advice = None
        co2_threshold = 1000
        ACH = m_value
        volume_of_room = 150
        if co2_indoor > co2_threshold:
            q = (volume_of_room * ACH * (co2_indoor - co2_outdoor)) / (co2_outdoor * 60)
            count_of_windows = 5
            total_window_area = 10
            velocity = 0.1 if abs(ACH) < 1 else 0.2 if abs(ACH) < 4 else 0.3
            area_window = q / (60 * velocity * count_of_windows)
            area_of_1_window = total_window_area / count_of_windows
            req_windows = area_window / area_of_1_window
            if req_windows < 1:
                co2_advice = "Indoor CO2 level is high, please open 1 window."
            elif req_windows > 1 and req_windows < count_of_windows:
                co2_advice = f"Indoor CO2 level is high, please open {math.ceil(req_windows)} windows."
            else:
                co2_advice = "Indoor CO2 level is high, please open all windows."

        aqi_advice = None

        if 23 < temp_outdoor < 27:
            if 30 < humidity < 70:
                aqi_advice = "Ambient air is favourable, open windows."



        I_humidity_data, I_temperature_data = get_historical_hourly_data_indoor(imei)
        O_humidity_data, O_temperature_data = get_historical_hourly_data_outdoor()
        
        response = {
            "timestamp": formatted_date_str,
            "outdoor_temperature": round(temp_outdoor, 1),
            "indoor_temperature": round(temp_indoor, 1),
            "outdoor_co2": round(co2_outdoor, 1),
            "indoor_co2": round(co2_indoor, 1),
            "outdoor_pm25": round(pm25_outdoor, 1),
            "indoor_pm25": round(pm25_indoor, 1),
            "humidity": round(humidity, 1),
            "temp_advice": temp_advice,
            "co2_advice": co2_advice,
            "co2_prev_day": co2_prev_day_data,
            "aqi_advice": aqi_advice,
            "historical_humidity_indoor": I_humidity_data,
            "historical_temperature_indoor": I_temperature_data,
            "historical_humidity_outdoor": O_humidity_data,
            "historical_temperature_outdoor": O_temperature_data
        }

        return jsonify(response)
    except Exception as e:
        app.logger.error(f"Server error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)

from flask import Flask, jsonify
import math
import pandas as pd
import numpy as np
from datetime import timedelta, datetime
import time
from sklearn.linear_model import LinearRegression
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

flag_ac = True

def fetch_data_with_retry(url, retries=15, delay=1):
    for attempt in range(retries):
        try:
            df = pd.read_csv(url)
            if df.empty:
                print(url)
                raise ValueError("DataFrame is empty")
            if attempt > 0:
                print(f"Data fetched successfully on attempt {attempt + 1}")
            return df
        except ValueError as ve:
            print(f"Attempt {attempt + 1} failed due to empty DataFrame. Error: {ve}")
            if attempt < retries - 1:
                print("Retrying...")
                time.sleep(delay)
        except Exception as e:
            print(f"Attempt {attempt + 1} failed. Error: {e}")
            if attempt < retries - 1:
                print("Retrying...")
                time.sleep(delay)
    raise RuntimeError(f"Failed after {retries} attempts")

def get_historical_hourly_data_indoor():
    end_date = datetime.now()
    start_date = end_date - timedelta(days=5)
    
    start_date_str = start_date.strftime('%Y-%m-%dT%H:%M')
    end_date_str = end_date.strftime('%Y-%m-%dT%H:%M')
    
    df = fetch_data_with_retry(
        f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/5CCF7F2CC093/params/temp,humidity/'
        + f'startdate/{start_date_str}/enddate/{end_date_str}/'
        + f'ts/hh/avg/1/api/s1SFoBxhm7?gaps=1&gap_value=NULL'
    )
    
    df["dt_time"] = pd.to_datetime(df["dt_time"])
    df.set_index("dt_time", inplace=True, drop=True)
    

    hourly_data = df.resample('h').mean(numeric_only=True)

    hourly_data = hourly_data.reset_index()
    hourly_data = round(hourly_data, 1)
    hourly_data['time'] = hourly_data['dt_time'].dt.strftime('%Y-%m-%dT%H:%M')
    humidity_data = hourly_data[['time', 'humidity']].dropna().to_dict(orient='records')
    temperature_data = hourly_data[['time', 'temp']].dropna().to_dict(orient='records')
    
    return humidity_data, temperature_data

def get_historical_hourly_data_outdoor():
    end_date = datetime.now()
    start_date = end_date - timedelta(days=5)
    
    start_date_str = start_date.strftime('%Y-%m-%dT%H:%M')
    end_date_str = end_date.strftime('%Y-%m-%dT%H:%M')
    
    df = fetch_data_with_retry(
        f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/500291EC2742/params/temp,humidity/'
        + f'startdate/{start_date_str}/enddate/{end_date_str}/'
        + f'ts/mm/avg/1/api/qc_airview?gaps=1&gap_value=NULL'
    )
    
    df["dt_time"] = pd.to_datetime(df["dt_time"])
    df.set_index("dt_time", inplace=True, drop=True)
    

    hourly_data = df.resample('h').mean(numeric_only=True)

    hourly_data = hourly_data.reset_index()
    hourly_data = round(hourly_data, 1)
    hourly_data['time'] = hourly_data['dt_time'].dt.strftime('%Y-%m-%dT%H:%M')
    humidity_data = hourly_data[['time', 'humidity']].dropna().to_dict(orient='records')
    temperature_data = hourly_data[['time', 'temp']].dropna().to_dict(orient='records')
    
    return humidity_data, temperature_data


@app.route('/')
def home():
    return "Flask App is Running"

@app.route('/data', methods=['GET'])
def get_data():
    global flag_ac
    start_date = (datetime.now() - timedelta(hours=1)).strftime('%Y-%m-%dT%H:%M')
    just_prev_date = (datetime.now() - timedelta(minutes=2)).strftime('%Y-%m-%dT%H:%M')
    #.replace(hour=0, minute=0, second=0, microsecond=0)
    prev_day_start = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%dT%H:%M')
    #.replace(hour=23, minute=59, second=59, microsecond=0)
    prev_day_end = (datetime.now() - timedelta(minutes=2)).strftime('%Y-%m-%dT%H:%M')

    try:
        df_outdoor = fetch_data_with_retry(f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/500291EC2742/params/pm2.5cnc,pm10cnc,co2conc,pres,temp,humidity,vocconc/'
                                           + f'startdate/{start_date}/enddate/{just_prev_date}/'
                                           + f'ts/mm/avg/1/api/qc_airview?gaps=1&gap_value=NULL')
        df_indoor = fetch_data_with_retry(f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/5CCF7F2CC093/params/pm2.5cnc,pm10cnc,co2conc,pres,temp,humidity,vocconc/'
                                          + f'startdate/{start_date}/enddate/{just_prev_date}/'
                                          + f'ts/mm/avg/1/api/s1SFoBxhm7?gaps=1&gap_value=NULL')
        df_prev_day = fetch_data_with_retry(f'https://atmos.urbansciences.in/adp/v4/getDeviceDataParam/imei/5CCF7F2CC093/params/co2conc/'
                                            + f'startdate/{prev_day_start}/enddate/{prev_day_end}/'
                                            + f'ts/mm/avg/1/api/s1SFoBxhm7?gaps=1&gap_value=NULL')

        df_indoor["dt_time"] = pd.to_datetime(df_indoor["dt_time"])
        df_indoor.set_index("dt_time", inplace=True, drop=True)
        df_prev_day["dt_time"] = pd.to_datetime(df_prev_day["dt_time"])
        df_prev_day.set_index("dt_time", inplace=True, drop=True)

        date_obj = datetime.strptime(just_prev_date, "%Y-%m-%dT%H:%M")
        formatted_date_str = date_obj.strftime("%d %b %Y %H:%M:%S")

        last_valid_index_temp_outdoor = df_outdoor["temp"].last_valid_index()
        temp_outdoor = df_outdoor.loc[last_valid_index_temp_outdoor, "temp"]

        last_valid_index_temp_indoor = df_indoor["temp"].last_valid_index()
        temp_indoor = df_indoor.loc[last_valid_index_temp_indoor, "temp"]

        last_valid_index_voc_indoor = df_indoor["vocconc"].last_valid_index()
        voc_indoor = df_indoor.loc[last_valid_index_temp_indoor, "vocconc"]

        last_valid_index_co2_outdoor = df_outdoor["co2conc"].last_valid_index()
        co2_outdoor = df_outdoor.loc[last_valid_index_co2_outdoor, "co2conc"]

        last_valid_index_co2_indoor = df_indoor["co2conc"].last_valid_index()
        co2_indoor = df_indoor.loc[last_valid_index_co2_indoor, "co2conc"]

        last_valid_index_pm25_outdoor = df_outdoor["pm2.5cnc"].last_valid_index()
        pm25_outdoor = df_outdoor.loc[last_valid_index_pm25_outdoor, "pm2.5cnc"]

        last_valid_index_pm25_indoor = df_indoor["pm2.5cnc"].last_valid_index()
        pm25_indoor = df_indoor.loc[last_valid_index_pm25_indoor, "pm2.5cnc"]
        
        last_valid_index_humidity = df_indoor["humidity"].last_valid_index()
        humidity = df_indoor.loc[last_valid_index_humidity, "humidity"]

        df_prev_day["co2conc"] = pd.to_numeric(df_prev_day["co2conc"], errors='coerce')
        df_prev_day = df_prev_day.dropna(subset=['co2conc'])
        df_prev_day = df_prev_day.resample('h').mean(numeric_only = True)
        df_prev_day = round(df_prev_day, 1)
        
        co2_prev_day = df_prev_day["co2conc"].tolist()
        timestamps_prev_day = df_prev_day.index.strftime('%Y-%m-%dT%H:%M:%S').tolist()
        co2_prev_day_data = [{"time": t, "co2": c} for t, c in zip(timestamps_prev_day, co2_prev_day)]

        df_indoor["hour"] = df_indoor.index.hour
        df_indoor["day"] = df_indoor.index.date
        df_indoor["minutes"] = df_indoor.index.minute
        grouped = df_indoor.groupby(['day', 'hour'])

        m_value = None
        for (day, hour), group in grouped:
            group = group.dropna(subset=['co2conc'])
            X = group[['minutes']]
            y = group['co2conc']
            try:
                model = LinearRegression()
                model.fit(X, y)
                m = model.coef_[0]
            except ValueError as e:
                print(f"Error encountered: {e}")
                m = np.nan
            m_value = m

        
        indoor_temp_req = 0.078 * temp_outdoor + 23.25
        indoor_temp_low_lim = indoor_temp_req - 1.5
        indoor_temp_high_lim = indoor_temp_req + 1.5

        temp_advice = None
        if indoor_temp_low_lim < temp_outdoor < indoor_temp_high_lim:
            temp_advice = "Outdoor temperature is in thermal comfort zone, please turn OFF AC and open all windows."
        elif temp_indoor > indoor_temp_high_lim:
            temp_advice = f"Temperature is {round(temp_indoor, 1)} which is above thermal comfort, please keep AC setpoint 23ºC."
        elif temp_indoor < indoor_temp_low_lim and flag_ac:
            temp_advice = f"Temperature is {round(temp_indoor, 1)} which is below thermal comfort, please consider turning OFF Air Conditioner OR Increase AC setpoint to 26ºC to conserve energy."

        co2_advice = None
        co2_threshold = 1000
        ACH = m_value
        volume_of_room = 150
        if co2_indoor > co2_threshold:
            q = (volume_of_room * ACH * (co2_indoor - co2_outdoor)) / (co2_outdoor * 60)
            count_of_windows = 5
            total_window_area = 10
            velocity = 0.1 if abs(ACH) < 1 else 0.2 if abs(ACH) < 4 else 0.3
            area_window = q / (60 * velocity * count_of_windows)
            area_of_1_window = total_window_area / count_of_windows
            req_windows = area_window / area_of_1_window
            if req_windows < 1:
                co2_advice = "Indoor CO2 level is high, please open 1 window."
            elif req_windows > 1 and req_windows < count_of_windows:
                co2_advice = f"Indoor CO2 level is high, please open {math.ceil(req_windows)} windows."
            else:
                co2_advice = "Indoor CO2 level is high, please open all windows."

        aqi_advice = None

        if 23 < temp_outdoor < 27:
            if 30 < humidity < 70:
                aqi_advice = "Ambient air is favourable, open windows."



        I_humidity_data, I_temperature_data = get_historical_hourly_data_indoor()
        O_humidity_data, O_temperature_data = get_historical_hourly_data_outdoor()

        response = {
            "timestamp": formatted_date_str,
            "outdoor_temperature": round(temp_outdoor, 1),
            "indoor_temperature": round(temp_indoor, 1),
            "outdoor_co2": round(co2_outdoor, 1),
            "indoor_co2": round(co2_indoor, 1),
            "outdoor_pm25": round(pm25_outdoor, 1),
            "indoor_pm25": round(pm25_indoor, 1),
            "humidity": round(humidity, 1),
            "indoor_voc": voc_indoor,
            "temp_advice": temp_advice,
            "co2_advice": co2_advice,
            "co2_prev_day": co2_prev_day_data,
            "aqi_advice": aqi_advice,
            "historical_humidity_indoor": I_humidity_data,
            "historical_temperature_indoor": I_temperature_data,
            "historical_humidity_outdoor": O_humidity_data,
            "historical_temperature_outdoor": O_temperature_data

        }

        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == '__main__':
    app.run(debug=True)
'''
