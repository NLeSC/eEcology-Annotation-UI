import csv
from json import dumps

czml = []
with open('355.2010-06-28.csv', 'rb') as csvfile:
    for row in csv.DictReader(csvfile):
        try:
            pos = [float(row['longitude']), float(row['latitude']), float(row['altitude'])]
        except ValueError:
            continue
        point = {
              "id": row['date_time'],
             "point": {
                       "color": {"rgba": [20,20,20,225]},
                       "pixelSize":  { "number": 8},
                       },
             "position": {
                          "cartographicDegrees": pos
                          }
             }

        czml.append(point)

print dumps(czml, indent=1)
