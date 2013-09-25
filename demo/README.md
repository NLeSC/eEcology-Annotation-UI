#Demostration

A demonstration of the user interface without web server and database access.
Can only load the default tracker + time range.

##Requirements


* Chrome web browser
* Google Earth

#Build

1. Build the UI as normal with

    sencha app build

2. Copy content `build/TrackAnnot/production/` to `demo/` directory.

    cd demo
    cp -r ../build/TrackAnnot/production/* ./

3. Pack `demo/` directory.

#Usage

1. Unpack demo.
2. Start Chrome web browser with `--allow-file-access-from-files` command line argument. See http://chrome-allow-file-access-from-file.com/ for instructions.
3. Open `demo/demo.html`.
4. If Google Earth is not installed then close the Google Eartch panel and open a Google Map panel.
