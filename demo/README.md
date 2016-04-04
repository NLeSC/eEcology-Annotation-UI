# Demonstration

A demonstration of the user interface without web server and database access.
Can only load the default tracker + time range.

## Requirements


* Chrome web browser
* Google Earth

# Build

1. Build the UI as normal with

    sencha app build

2. Copy content `build/production/TrackAnnot/` to `demo/` directory.

    cd demo
    cp -r ../build/production/TrackAnnot/* ./

3. Use static json files

    perl -pi -e 's!this.setupUrls\("/aws/trackers","/aws/tracker/{trackerId}/{start}/{end}"\);!this.setupUrls("trackers.json","tracker.json");!' app.js

4. Pack `demo/` directory.

# Usage

1. Unpack demo.
2. Start Chrome web browser with `--allow-file-access-from-files` command line argument. See http://chrome-allow-file-access-from-file.com/ for instructions.
3. Open `demo/demo.html`.
4. If Google Earth is not installed then close the Google Earth panel and open a Google Map panel.

Alternative demo without annotations (which loads much faster) is available at `demo/demo-na.html`.
