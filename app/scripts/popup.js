// @copyright 2012+ Daniel Nakov / SilverlineCRM
// http://silverlinecrm.com

 	document.addEventListener('DOMContentLoaded', function () {

        document.getElementById('save').addEventListener('click', save);
        main();
    });



function main() {

chrome.browserAction.setBadgeText({text:""});
 chrome.extension.sendMessage({'action':'Get Settings'},
      function(response) {
      	console.log(response);
      	document.getElementById('shortcut').value = response['shortcut'];

      }
     );

  // chrome.storage.local.get('shortcut', function(results) {
  //   console.log(results);
  //   if(typeof results.settings === 'undefined')
  //   {
  //     document.getElementById('shortcut').value = 'shift+space';
  //   }
  //   else
  //   {
  //     document.getElementById('shortcut').value = results.settings.shortcut;
  //   }
  // });
}
 function save()
 {
 	var payload = document.getElementById('shortcut').value;
  // chrome.storage.local.set(payload, function() {
  //   console.log('saved shortcut');
  //   chrome.tabs.getSelected(null, function(tab) {
  //   var code = 'window.location.reload();';
  //   chrome.tabs.executeScript(tab.id, {code: code});
  //   });
  // });


	 chrome.extension.sendMessage({'action':'Set Settings', 'key':'shortcut', 'payload':payload},
	      function(response) {
	      	  chrome.tabs.getSelected(null, function(tab) {
            var code = 'window.location.reload();';
            chrome.tabs.executeScript(tab.id, {code: code});
          });
	      }
	     );

 }
