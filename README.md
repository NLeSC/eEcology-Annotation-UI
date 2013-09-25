eEcology Annotation UI
======================

Web interface to annotate trackers in the eEcology project.

Issue tracker is available at https://services.e-ecology.sara.nl/redmine/projects/uvagps, use `Annotation` category for new issues.

Packages
--------

* NLeSC shared
** DateTime
* eEcology shared
** Tracker selectors

### New package ###

1. Create local repo

    sencha repository init --name NLeSC

2. Create workspace

    sencha -sdk /tmp/ext-4.2.1.883 generate workspace .

3. Create package

    sencha generate package -t code datetime

4. Fill package

    cd packages/datetime
    <add files to src/>

5. Edit package.json to make author same as the name in step 1.
5.1 Add 'package.framework=ext' to .sencha/package/sencha.cfg

6. Build package

    sencha package build

7. Add package to local repo

    cd ../..
    sencha package add build/datetime/datetime.pkg

8. In App add package name to app.json:requires.

    requires:['datetime']

9. Refresh app and build.

    sencha app refresh
    sencha app build

Deploy app
----------

1. Build it

    sencha app build

2. Make build/production/TrackAnnot directory available on webserver.
3. Webservice url is hardcoded to /aws so deploy it there on same server as ui.

Setup app
---------

On github the ext/ folder is not present.
The ext folder should contain an unzipped ExtJS distro.


Libraries
---------

In lib/ directory.

* d3
* popcorn.js

Test
----

Use https://github.com/deftjs/DeftJS as an example.
With JasmineBDD instead of chai, sinon, mocha.
Try out Ext Spec (http://extspec.codeplex.com).

### Karma ###

    sudo apt-get install phantomjs

    sudo npm install -g karma karma-coverage karma-junit-reporter

    karma init

Edit karma.conf.js
Add junit reporter.
Add coverage reporter with preprocessors and coverageReporter.
Set singleRun: true.

    karma start

Documentation
-------------

Use jsduck.

Web service
-----------

In seperate repo called 'eEcology Annotation WS'.

Demo
----

There is a demo available [here](demo/README.md).
