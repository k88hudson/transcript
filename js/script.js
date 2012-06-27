/* Author:
@k88hudson
*/
document.addEventListener( "DOMContentLoaded", function(){

  var linesContainer = document.getElementById( "lines-container" ),
      lines = document.querySelectorAll( ".lines li" ),
      visualisation = document.getElementById( "visualisation" ),
      scrubberContainer = document.getElementById( "scrubber-container" ),
      scrubber = document.getElementById( "scrubber" ),
      shrinkFactor = 0.1,
      visTotal,
      p;

  // POPCORN
  p = Popcorn.youtube("#popcorn", "http://www.youtube.com/watch?v=aObwAhpkNsQ");
  p.currentTime( 0 );
  window.p = p;

  function syncSubtitles( element, dataset ) {
    var timeArray = [],
        count = 0,
        toggle = 0;

    console.log( "Syncing." );

    function _sync( e ) {
      if ( e.keyCode === 32 ) {
        e.preventDefault();
        console.log ( p.currentTime(),  dataset[ count ].text );
        timeArray.push( { "time": p.currentTime(), "text": dataset[ count ].text } );
        count ++;
      }
    }

    function slowmo(){
      if ( toggle === 0 ) {
        p.pause();
        toggle = 1;
      } else {
        p.play();
        toggle = 0;
      }
    }

    window.setInterval( slowmo, 100 );
    window.addEventListener( "keypress", _sync  , false );

    element.addEventListener( "click", function() {
      window.removeEventListener( "keypress", _sync );
      window.clearInterval( slowmo );
    }, false);

  }

  //Create the lines;
  Popcorn.xhr({
    url: "data/macbeth_1_7.json",
    dataType: "json",
    success: function( data ) {
      console.log( data );

      //Add the lines
      Popcorn.forEach( data.data, function( paragraph, i ) {
        var paragraphEl = document.createElement( "blockquote" ),
            speakerEl = document.createElement ( "p" ),
            linesEl = document.createElement( "ul" ),
            index = paragraph.firstLine,
            clone;

            speakerEl.classList.add( "speaker" );
            speakerEl.innerHTML = paragraph.speaker;
            speakerEl.addEventListener( "click", function(){
              syncSubtitles( speakerEl, paragraph.lines );
            }, false);

            linesEl.classList.add( "lines" );

            Popcorn.forEach( paragraph.lines, function( line ) {
              var lineEl = document.createElement( "li" );

              lineEl.setAttribute( "data-t", line.time );
              lineEl.innerHTML = "<span class=\"line-number\">" + index + "</span>" + line.text;
              linesEl.appendChild( lineEl );

              //Add popcorn event listener
              if ( line.time ) {
                (function( lineEl ) {
                  lineEl.addEventListener( "dblclick", function( e ){
                    e.preventDefault();
                    p.currentTime( line.time );
                    p.play();
                  }, false);
                }( lineEl ));
              }

              index++;
            });

            paragraphEl.appendChild( speakerEl );
            paragraphEl.appendChild( linesEl );
            linesContainer.appendChild( paragraphEl );

            //After we're all done, create the clone.
            if( i === data.data.length -1 ) {
              //Create the clone and add to the DOM.
              clone = linesContainer.cloneNode( true );
              clone.classList.add( "clone" );
              clone.id = "clone";
              console.log( linesContainer.scrollHeight );
              visTotal = linesContainer.scrollHeight * shrinkFactor,
              visualisation.style["-webkit-transform"] = "scale("+shrinkFactor+", "+shrinkFactor+")";
              visualisation.appendChild( clone );
              scrubberContainer.style.height = visTotal + "px";
            }
        
      });
    }
  });


  function addLineNumber( el, number ){
    var lineSpan;
    if ( !el ) { return; }

    //Account for array starting at 0
    number += 1;
    
    el.innerHTML = "<span class=\"line-number\">" + number + "</span>" + el.innerHTML;
    lineSpan = el.querySelector( ".line-number" );
    lineSpan.addEventListener( "click", function( e ){
      var editingBox = document.createElement( "div" );
      editingBox.classList.add( "editing-box" );
      editingBox.innerHTML = "<textarea>Type your comment...</textarea>" +
        "<div><button class=\"editing-btn btn-save\">Save</button> <button class=\"editing-btn btn-close\">Close</button>";
      el.appendChild( editingBox );
      setTimeout( function(){
        editingBox.classList.add( "editing-active" );
      }, 100);
      editingBox.querySelector( ".btn-save" ).addEventListener( "click", function(e){
        el.removeChild( editingBox );
      }, false);
      editingBox.querySelector( ".btn-close" ).addEventListener( "click", function(e){
        el.removeChild( editingBox );
      }, false);
    }, false);
  }

  $("#scrubber").draggable( {
      containment: "parent",
      drag: function( ui ){
        var visTop = this.style.top.replace("px", ""),
            percentage = visTop/visTotal;
        $("#lines-container").scrollTo( { top: visTop * 1/shrinkFactor + "px", left: 0 });
      }
    });

}, false);
