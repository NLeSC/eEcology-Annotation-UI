(function ( Popcorn ) {

	  var i = 0,
	      createDefaultContainer = function( context, id ) {

	        var ctxContainer = context.container = document.createElement( "div" ),
            style = ctxContainer.style,
            media = context.media;

        var updatePosition = function() {
          var position = context.position();
          // the video element must have height and width defined
          style.fontSize = "18px";
          style.width = media.offsetWidth + "px";
          style.top = 10 + "px";
          style.left = 10 + "px";

          setTimeout( updatePosition, 10 );
        };

        ctxContainer.id = id || Popcorn.guid();
        style.position = "absolute";
        style.color = "yellow";
        style.textShadow = "black 2px 2px 6px";
        style.fontWeight = "bold";
        style.textAlign = "left";

        updatePosition();

        context.media.parentNode.appendChild( ctxContainer );

        return ctxContainer;
      };

  /**
   * Subtitle popcorn plug-in
   * Displays a subtitle over the video, or in the target div
   * Options parameter will need a start, and end.
   * Optional parameters are target and text.
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing
   * Target is the id of the document element that the content is
   *  appended to, this target element must exist on the DOM
   * Text is the text of the subtitle you want to display.
   *
   * @param {Object} options
   *
   * Example:
     var p = Popcorn('#video')
        .subtitle({
          start:            5,                 // seconds, mandatory
          end:              15,                // seconds, mandatory
          text:             'Hellow world',    // optional
          target:           'subtitlediv',     // optional
        } )
   *
   */

  Popcorn.plugin( "annotation" , {

      manifest: {
        about: {
          name: "Popcorn Annotation Plugin",
          version: "0.1",
          author: "Stefan Verhoeven",
          website: "http://www.nlesc.nl/"
        },
        options: {
          start: {
            elem: "input",
            type: "text",
            label: "Start"
          },
          end: {
            elem: "input",
            type: "text",
            label: "End"
          },
          target: "subtitle-container",
          text: {
            elem: "input",
            type: "text",
            label: "Text"
          }
        }
      },

      _setup: function( options ) {
        var newdiv = document.createElement( "div" );

        newdiv.id = "subtitle-" + i++;
        newdiv.style.display = "none";

        // Creates a div for all subtitles to use
        ( !this.container && ( !options.target || options.target === "subtitle-container" ) ) &&
          createDefaultContainer( this );

        // if a target is specified, use that
        if ( options.target && options.target !== "subtitle-container" ) {
          // In case the target doesn't exist in the DOM
          options.container = document.getElementById( options.target ) || createDefaultContainer( this, options.target );
        } else {
          // use shared default container
          options.container = this.container;
        }

        document.getElementById( options.container.id ) && document.getElementById( options.container.id ).appendChild( newdiv );
        options.innerContainer = newdiv;

        options.showSubtitle = function() {
          options.innerContainer.innerHTML = options.text || "";
        };
      },
      /**
       * @member subtitle
       * The start function will be executed when the currentTime
       * of the video  reaches the start time provided by the
       * options variable
       */
      start: function( event, options ){
        options.innerContainer.style.display = "inline";
        options.showSubtitle( options, options.text );
      },
      /**
       * @member subtitle
       * The end function will be executed when the currentTime
       * of the video  reaches the end time provided by the
       * options variable
       */
      end: function( event, options ) {
        options.innerContainer.style.display = "none";
        options.innerContainer.innerHTML = "";
      },

      _teardown: function ( options ) {
        options.container.removeChild( options.innerContainer );
      }

  });

})( Popcorn );

Ext.define("TrackAnnot.view.Popcorn", {
    extend: 'Ext.Component',
    alias: 'widget.popcorn',
    config: {
        url: null,
        startDate: null,
        annotationStore: 'Annotations'
    },
    initComponent: function(config) {
    	this.callParent(arguments);
        this.initConfig(config);
    },
    onResize: function(width, height, oldWidth, oldHeight) {
        if (oldWidth == undefined && oldHeight == undefined) {
         //   return;
        }
        // resize video tag
    	this.pop.media.width = width;
    	this.pop.media.height = height;
    },
    afterRender: function() {
    	var el = this.getEl();
    	var vid = this.vid = el.createChild({
    		tag: 'video',
    		preload: 'auto',
    		autobuffer: null,
    		controls: null
    	});

    	// add video sources
    	this.url.forEach(function(u) {
    		vid.createChild({
    			tag: 'source',
    			src: u
    		});
    	});

    	this.pop = Popcorn(vid.dom);
    	//this.pop.controls(false);
    },
    remove: function() {
    	this.pop.destroy();
    	this.callParent(arguments);
    }
});