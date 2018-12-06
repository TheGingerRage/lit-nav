var commands = {};
var metadata = {};
var lastUpdated = {};

chrome.browserAction.setPopup({popup:"popup.html"});
chrome.runtime.onInstalled.addListener(function(info) {
    // if(info.details == "update" || info.details == "install") {
        // chrome.browserAction.setBadgeText({text:"1"});
    // }
})


chrome.browserAction.onClicked.addListener(function() {
    chrome.browserAction.setPopup({popup:"popup.html"});
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    var orgKey = request.key != null ? request.key.split('!')[0] : null;

    if(request.action == 'Store Commands')
    {
      Object.keys(commands).forEach(function(key) {
        if(key != request.key && key.split('!')[0] == orgKey)
          delete commands[key];
      });
      commands[request.key] = commands[orgKey] = request.payload;
      lastUpdated[orgKey] = new Date();
      sendResponse({});
    }
    if(request.action == 'Get Commands')
    {
      if(commands[request.key] != null)
        sendResponse(commands[request.key]);
      else if(commands[orgKey] != null &&
        lastUpdated[orgKey] != null &&
        new Date().getTime() - lastUpdated[orgKey].getTime() < 1000*60*60)

          sendResponse(commands[orgKey]);
      else
        sendResponse(null);
    }
    if(request.action == 'Get Settings')
    {
      var settings = localStorage.getItem('sfnav_settings');
      console.log('settings: ' + settings);
      if(settings != null)
      {
        sendResponse(JSON.parse(settings));
      }
      else
      {
        var sett = {};
        sett['shortcut'] = 'ctrl+shift+space';
        localStorage.setItem('sfnav_settings', JSON.stringify(sett));
        sendResponse(sett);
      }
    }
    if(request.action == 'Set Settings')
    {
      var settings = localStorage.getItem('sfnav_settings');
      if(settings != null)
      {
        var sett = JSON.parse(settings);
        sett[request.key] = request.payload;
        localStorage.setItem('sfnav_settings', JSON.stringify(sett));
      }
      sendResponse({});
    }
    if(request.action == 'Store Metadata')
    {
      Object.keys(metadata).forEach(function(key) {
        if(key != request.key && key.split('!')[0] == orgKey)
          delete metadata[key];
      });
      metadata[request.key] = metadata[orgKey] = request.payload;
      sendResponse({});
    }
    if(request.action == 'Get Metadata')
    {
      if(metadata[request.key] != null)
        sendResponse(metadata[request.key]);
      else if(metadata[orgKey] != null)
        sendResponse(metadata[orgKey]);
      else
        sendResponse(null);
    }
  });
