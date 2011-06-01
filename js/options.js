var viewModel;
var observedPrefs = [ 'radar',
                      'backgroundMode',
                      'customDestinationValue' ];
var observedBoolPrefs = [ 'showTopographyLayer',
                          'showLocationsLayer',
                          'showRangeLayer',
                          'defaultDestination' ];

(function($, undefined) {
  var _prefs = widget.preferences;
  function observablePreference(prefKey, isBool) {
    var prefVal = _prefs[prefKey]

    if (isBool) {
      prefVal = prefVal == true;
    }

    var observable = ko.observable(prefVal);
    observable.subscribe(function(newValue) {
      _prefs[prefKey] = !!isBool ? (newValue == true ? "1" : "0") : newValue;
    });
    return observable;
  }

  function updateLabel() {
    var selected = $('.selectedRadar');
    var selectedRow = selected.parents('tr');
    var placeName = $.trim(selectedRow.find('td:first').text());
    var distance = $.trim(selected.text());

    $('.selName').text(placeName + ' (' + distance + ')'); 
  };

  function setupViewModel() {
    viewModel = { };

    function observePreference(prefKey, isBool) {
      viewModel[prefKey] = observablePreference(prefKey, isBool);
    }

    for (i in observedPrefs) {
      observePreference(observedPrefs[i]);
    }
    for (i in observedBoolPrefs) {
      observePreference(observedBoolPrefs[i], true);
    }

    function delayedLabelUpdate() {
      setTimeout(updateLabel, 30);
    }

    viewModel.radar.subscribe(delayedLabelUpdate);
    
    ko.applyBindings(viewModel);
    delayedLabelUpdate();
  }

  function applyTooltips() {
    function content(imageName) {
      return "<img src='images/" + imageName + "'/>";
    }

    function options(imageName) {
      return { 
        delay: 40,
        maxWidth: "381px",
        content: content(imageName)
      };
    }

    $('#cover').tipTip(options("fill.png"));
    $('#fit').tipTip(options("fit.png"));
    $('#fill').tipTip(options("stretch.png"));
    $('#none').tipTip(options("center.png"));

    function radarBackgroundContent(radarName) {
      return "<img src='http://www.bom.gov.au/products/radar_transparencies/" +
          radarName + ".background.png' style='width: 250px; height: 250px'/>";
    }

    function radarOptions(radarName) {
      return {
        delay: 400,
        maxWidth: '260px',
        content: radarBackgroundContent(radarName)
      };
    }

    $("[radarname]").each(function() {
      $(this).tipTip(radarOptions($(this).attr('radarName')));
    })

  }

  $(function() {
    setupViewModel();
    applyTooltips();

    $('#search').domsearch('table#radars', { criteria: ['td:first-child'] });
  });
})(jQuery);