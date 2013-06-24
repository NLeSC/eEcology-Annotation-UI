from lxml import etree
from json import dumps
import time

t = etree.parse('S355_museumplein.kml')
r = t.getroot()

czml = []
path = []

for p in r[0][2:]:  # skip linestring
    begin = p[1][0].text
    end = p[1][1].text

    description = p[3].text
    dt = etree.fromstring(description)
    utm_time = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.strptime(dt[1][1].text, '%d-%b-%Y %H:%M:%S'))
    sensor_time = dt[3][1].text
    tp_speed = dt[7][1].text

    hex_color = p[4][0].text  # abgr
    rgba_color = [int(hex_color[6:8], 16),  # r
                  int(hex_color[4:6], 16),  # g
                  int(hex_color[2:4], 16),  # b
                  int(hex_color[0:2], 16),  # a
                  ]  # rgba
    scale = p[4][1].text
    coord = p[6][3].text.strip().split(',')
    pos = [float(coord[0]), float(coord[1]), float(coord[2])]
    point = {
           "id": "test_1",
           "anchor": { "geolocation": { "lat": 52.3729, "lon": 4.93 } },
           "text": {
             "title": "The Layar Office",
             "description": description,
             "footnote": "Powered by Layar" },
             "imageURL": "http:\/\/custom.layar.nl\/layarimage.jpeg"
         }
    {
             "point": {
                       "color": {"rgba": rgba_color},
                       # "outlineWidth": 0.0,
                       },
             "position": {
                          "cartographicDegrees": pos
                          },
             "meta": {
                      "utm_time": utm_time,
                      "sensor_time": sensor_time,
                      "tp_speed": tp_speed,
                      },
             }

    path.append(utm_time)
    path.extend(pos)

#    print dumps(point)
    czml.append(point)


img = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAATCAYAAACKsM07AAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAIVJREFUOMvdVLENwCAMi/mFkac4jKcYOYYupQMCktAgVc1IhB2bYNBd2ccaSgIJKvtYZ71QElo/lATHXdCAj/oYHa6UaIYhInIaEC34lKCB7QD2TmB3Mg6YVWBVPyGQfrBvW3RKhbmCflB3EvzJIotImFl8/JFhkTdLgjdZJNk87HivWekLhn0/K9S0iGYAAAAASUVORK5CYII='

min_time = path[0]
max_time = path[len(czml)*4-4]
interval = min_time+'/'+max_time

track = {
    "hotspots": czml,
     "layer": "Sensor355",
     "errorString": "ok",
     "errorCode": 0
}

#czml.insert(0, track)
#czml.append(track)

print dumps(track, indent=1)
