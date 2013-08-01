import csv
import datetime
from json import dumps

#"date_time","index","x_acceleration","y_acceleration","z_acceleration"
#"2010-06-28 00:02:46","0","-128","-153","1349"

accels = {}
with open('355.2010-06-28.accel.csv', 'rb') as csvfile:
    for row in csv.DictReader(csvfile):
        if row['date_time'] not in accels:
            accels[row['date_time']] = []
        try:
            accels[row['date_time']].append({'time':int(row['index'])/20.0,  # use 20Hz as freq
                                             "x_acceleration":int(row["x_acceleration"]),
                                             "y_acceleration":int(row["y_acceleration"]),
                                             "z_acceleration":int(row["z_acceleration"])})
        except ValueError:
            continue

#"date_time","latitude","longitude","altitude","pressure","temperature","satellites_used","gps_fixtime","positiondop","h_accuracy","v_accuracy","x_speed","y_speed","z_speed","speed_accuracy","vnorth","veast","vdown","speed","speed3d","direction"
#"2010-06-28 00:02:46","53.009559199999998","4.7180505000000004","5","\N","21.5","6","18.399999999999999","3.1000000000000001","4.7999999999999998","9.8000000000000007","0","0","0","1.23","0","0","-0","0","0","0.0"

data = []
with open('355.2010-06-28.speed.csv', 'rb') as csvfile:
    for row in csv.DictReader(csvfile):
        if row['date_time'] in accels:
            row['accels'] = accels[row['date_time']]
        try:
            row['latitude'] = round(float(row['latitude']), 4)
            row['longitude'] = round(float(row['longitude']), 4)
            row['satellites_used'] = int(row['satellites_used'])
            for x in ['altitude', 'temperature', "gps_fixtime","positiondop","h_accuracy","v_accuracy","x_speed","y_speed","z_speed","speed_accuracy","vnorth","veast","vdown","speed","speed3d","direction"]:
                row[x] = float(row[x])
            row['date_time'] = datetime.datetime.strptime(row['date_time'], '%Y-%m-%d %H:%M:%S').isoformat()
            data.append(row)
        except ValueError:
            continue

print dumps(data)
