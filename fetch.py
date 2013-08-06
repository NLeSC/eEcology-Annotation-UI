#!/bin/env python

"""
Script to generate input file for VL-AMA:

python fetch.py > 355.2010-06-28.json


Change settings at top of file to fetch other track
"""

import psycopg2
import psycopg2.extras
import json
import datetime
import logging

start = '2010-06-28T00:00:33Z'
end = '2010-06-29T00:35:33Z'
trackerId = 355
freq = 20.0

conn = psycopg2.connect(database='eecology', user='stefan_verhoeven', host='db.e-ecology.sara.nl', sslmode='require')

cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

accels = {}
sql1  = 'SELECT date_time, index, (x_acceleration-x_o)/x_s x_acceleration, '
sql1 += '(y_acceleration-y_o)/y_s y_acceleration, (z_acceleration-z_o)/z_s z_acceleration '
sql1 += 'FROM gps.uva_acceleration101 '
sql1 += 'JOIN gps.uva_device USING (device_info_serial) '
sql1 += 'WHERE device_info_serial = %s and date_time between %s and %s'
cur.execute(sql1, (trackerId, start, end))
for row in cur:
    if row['date_time'] not in accels:
        accels[row['date_time']] = []
    try:
        accels[row['date_time']].append({'time':int(row['index'])/freq,  # use 20Hz as freq
                                         "x_acceleration":row["x_acceleration"],
                                         "y_acceleration":row["y_acceleration"],
                                         "z_acceleration":row["z_acceleration"]})
    except ValueError:
        continue

data = []
sql2 = 'SELECT date_time,latitude,longitude,altitude,pressure,temperature,satellites_used,gps_fixtime,positiondop,h_accuracy,v_accuracy,x_speed,y_speed,z_speed,speed_accuracy,vnorth,veast,vdown,speed,speed3d,direction FROM gps.uva_tracking_speed WHERE device_info_serial = %s AND date_time BETWEEN %s AND %s AND userflag != %s'
cur.execute(sql2, (trackerId, start, end, "1"))
for row in cur:
    row = dict(row)
    if row['date_time'] in accels:
        row['accels'] = accels[row['date_time']]
    try:
        row['latitude'] = round(float(row['latitude']), 4)
        row['longitude'] = round(float(row['longitude']), 4)
        row['satellites_used'] = int(row['satellites_used'])
        for x in ['altitude', 'temperature', "gps_fixtime","positiondop","h_accuracy","v_accuracy","x_speed","y_speed","z_speed","speed_accuracy","vnorth","veast","vdown","speed","speed3d","direction"]:
            if row[x] is not None:
                row[x] = float(row[x])
        row['date_time'] = row['date_time'].isoformat()
        data.append(row)
    except ValueError:
        continue
    except TypeError:
        continue

print json.dumps(data)
