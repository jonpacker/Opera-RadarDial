(function($, undefined) {
  var domainBase = "http://www.bom.gov.au";
  var layerPath = "/products/radar_transparencies/";

  var layers;

  var imageCyclePaths = [];
  var imageCycleIndex = 0;
  var imageCycleDelay = 333;

  var _prefs = widget.preferences;
  var _context = opera.contexts.speeddial;
  var currentRadar = "";

  function setTitle(title) {
    if (_context) {
      _context.title = title;
    }
  }

  function setUrl(url) {
    if (_context) {
      _context.url = url;
    }
  }

  function loopURL() {
    return domainBase + "/products/" + _prefs.radar + ".loop.shtml";
  }

  function handleAjaxReturn(xhro) {
    var html = xhro.responseText;
    var imageMatcher = /theImageNames\[.\]\s=\s"(.{30,40})"/gi;
    var imagePaths = [];
    var matchResult;
    while ((matchResult = imageMatcher.exec(html))) {
      imagePaths.push(matchResult[1]);
    }

    imageCyclePaths = imagePaths;
  }

  var imageCycle;

  function updateRadarBase() {
    layers = {
      background: domainBase + layerPath + _prefs.radar + ".background.png",
      locations: domainBase + layerPath + _prefs.radar + ".locations.png",
      range: domainBase + layerPath + _prefs.radar + ".range.png",
      topography: domainBase + layerPath + _prefs.radar + ".topography.png"
    }
    for (layer in layers) {
      $('#' + layer).attr('src', layers[layer]);
    }
  }

  function updateRadarImages() {
    $.ajax({
      url: loopURL(),
      dataType: 'xml',
      type: 'GET',
      success: handleAjaxReturn
    })
  }

  function syncWithPreferences() {
    var topography = _prefs.showTopographyLayer == true ? 'visible' : 'hidden';
    var locations = _prefs.showLocationsLayer == true ? 'visible' : 'hidden';
    var range = _prefs.showRangeLayer == true ? 'visible' : 'hidden';

    $('#topography').css('visibility', topography);
    $('#locations').css('visibility', locations);
    $('#range').css('visibility', range);

    $('output,img').css('-o-object-fit', _prefs.backgroundMode);

    if (_prefs.defaultDestination == false) {
      setUrl(_prefs.customDestinationValue);
    } else {
      setUrl(loopURL());
    }

    if (currentRadar != _prefs.radar) {
      currentRadar = _prefs.radar;
      imageCyclePaths = [];
      updateRadarBase();
      updateRadarImages();
    }
  }


  function endCycle() {
    syncWithPreferences();
  }

  function imageCycleNext() {
    var isEndCycle = imageCycleIndex == imageCyclePaths.length - 1;
    var delay = isEndCycle ? (imageCycleDelay * 3) : imageCycleDelay;
    setTimeout(imageCycle, delay);
    if (isEndCycle || imageCyclePaths.length == 0) {
      setTimeout(endCycle, delay);
    }
  }

  imageCycle = function() {
    if (imageCyclePaths.length > 0) {
      imageCycleIndex = (imageCycleIndex + 1) % imageCyclePaths.length;
      $('#radar').attr('src', domainBase + imageCyclePaths[imageCycleIndex]);
    }

    imageCycleNext();
  }

  $(function() {
    syncWithPreferences();
    imageCycle();

    setInterval(updateRadarImages, 1000 * 60 * 6); //radar only updates every 6 minutes.
  });

})(jQuery);