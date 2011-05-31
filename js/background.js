(function($, undefined) {
  var radarCode = "IDR661";
  var domainBase = "http://www.bom.gov.au";
  var loopURL = domainBase + "/products/" + radarCode + ".loop.shtml";
  var layerPath = "/products/radar_transparencies/";

  var layers = {
    background: domainBase + layerPath + radarCode + ".background.png",
    locations: domainBase + layerPath + radarCode + ".locations.png",
    range: domainBase + layerPath + radarCode + ".range.png",
    topography: domainBase + layerPath + radarCode + ".topography.png"
  }

  var imageCyclePaths = [];
  var imageCycleIndex = 0;
  var imageCycleDelay = 333;

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

  function imageCycleNext() {
    var delay = imageCycleIndex == imageCyclePaths.length - 1 ?
                (imageCycleDelay * 3) : imageCycleDelay;
    setTimeout(imageCycle, delay);
  }

  imageCycle = function() {
    if (imageCyclePaths.length > 0) {
      imageCycleIndex = (imageCycleIndex + 1) % imageCyclePaths.length;
      $('#radar').attr('src', domainBase + imageCyclePaths[imageCycleIndex]);
    }

    imageCycleNext();
  }

  $(function() {
    for (layer in layers) {
      $('#' + layer).attr('src', layers[layer]);
    }

    imageCycle();

    $.ajax({
      url: loopURL,
      dataType: 'xml',
      type: 'GET',
      success: handleAjaxReturn
    })
  });

})(jQuery);