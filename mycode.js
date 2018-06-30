//Global Variables
var Google_key = "AIzaSyAr71tPSDDFQo22kA9-kklZEHxFQg7ECwM";
var events;
var currentEvent;
var map;

//Eventfull API parameters
var oArgs = {
          app_key:"tDjWBXFLvPXf7NML",
          date:"Future",//Search for future events
          sort_order: 'date'//Sort by date
        };

$(document).on("click", "#refresh", function() {

  event.preventDefault();
  //1. Get current location
  $.post("https://www.googleapis.com/geolocation/v1/geolocate?key="+Google_key,function(response){

      var lat = response.location.lat;
      var lng = response.location.lng;
      oArgs.where = lat +","+ lng; //set current location
      oArgs.within=10;//Search within 10 miles of current location
      oArgs.page_size=25;//Get 25 results
      //Call Search method of the API using the above parameters
      EVDB.API.call("/events/search", oArgs, function(oData) {

          events = oData.events;
          //clear the list
          $('#eventsList li').remove();
          for(var counter=0;counter<events.event.length;counter++){
            var date = events.event[counter].start_time.split(" ");//Extract the date from datetime
            //append the events
            $('#eventsList').append(
               '<li><a id="to_details" href="#"><h2>'+events.event[counter].title+'</h2>'+
               '<p id='+counter+' ><strong>'+events.event[counter].city_name+'</strong></p>'+
               '<p class="ui-li-aside"><strong>'+date[0]+'</strong></p>'+
               '</a></li>');
          }
          $('#eventsList').listview('refresh');
        });
      });
});

$(document).on('pagebeforeshow','#home',function(){
    $(document).on('click','#to_details',function(e){
      e.preventDefault();
      e.stopImmediatePropagation();
      //console.log(e);
      //Store the event Id
      currentEvent = e.currentTarget.childNodes[1].id;
      $.mobile.changePage("#details")
    })
})
$(document).on('pagebeforeshow','#details',function(e){
      e.preventDefault();
      //Display event details
	  $('#eventIcon').attr('src','');
	  if(events.event[currentEvent].image){
		  if(events.event[currentEvent].image.thumb.url.startsWith("//")){//Check if image url starts correctly
			$('#eventIcon').attr('src','http:'+events.event[currentEvent].image.thumb.url);
		  }
		  else{
			$('#eventIcon').attr('src',events.event[currentEvent].image.thumb.url);
		  }
	  }
      $('#eventName').text(events.event[currentEvent].title);
      //Check if event have description
      if(events.event[currentEvent].description){
        $('#eventDescription').html("<strong>Description: </strong>"+events.event[currentEvent].description);
      }
      else{
        $('#eventDescription').html("<strong>Description: </strong>"+events.event[currentEvent].title);
      }
      $('#eventVenue').html("<strong>Venue: </strong>"+events.event[currentEvent].venue_name+','+events.event[currentEvent].venue_address+',' +events.event[currentEvent].city_name);
      $('#eventStartTime').html("<strong>Start Time: </strong> "+events.event[currentEvent].start_time);
      $('#eventUrl').html("<strong>More on: </strong><a id='moreOn' target='_blank' href='"+events.event[currentEvent].venue_url+"/'>"+events.event[currentEvent].venue_url+"</a>");

})

$(document).on('click','#showInMap',function(e){
  //remove if map container has been set
    if(map){
      map.off();
      map.remove();
    }
  map = L.map('map-canvas-div').setView([events.event[currentEvent].latitude, events.event[currentEvent].longitude],13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  	maxZoom: 15,
  	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  var marker = L.marker([events.event[currentEvent].latitude, events.event[currentEvent].longitude]).addTo(map);
  marker.bindPopup("<b>"+events.event[currentEvent].venue_address+","+events.event[currentEvent].venue_name+"</b><br><b>"+events.event[currentEvent].city_name+"</b>");
  //invalidate size to display leaflet map properly
  setTimeout(function(){ map.invalidateSize()}, 400);

})
