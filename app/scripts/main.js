// @copyright 2012+ Daniel Nakov / Silverline CRM
// http://silverlinecrm.com
// @copyright 2018+ Bryan Mitchell / nCino
// http://ncino.com

chrome.runtime.sendMessage({ action: 'Fetch Cookie' });

var litnav = (function() {
  var cookie;
  var serverInstance;
  var clientId, omnomnom, hash;
  var outp;
  var tabHolder;
  var oldins;
  var posi = -1;
  var newTabKeys = [
    "ctrl+enter",
    "command+enter",
    "shift+enter"
  ]
  var metaData = {};
  var cmds = {};
  var shortcut;
  var sid;
  var sort;
  var SFAPI_VERSION = 'v33.0';
  var ftClient;
  var customObjects = {};

  chrome.runtime.onMessage.addListener(
    request => {
      if(request.cookie) {
        cookie = request.cookie;
        omnomnom = cookie.value;
        clientId = omnomnom.split('!')[0];
        hash = clientId + '!' + omnomnom.substring(omnomnom.length - 10, omnomnom.length);
        serverInstance = `https://${cookie.domain}`;

        init();

        chrome.runtime.sendMessage({ action: 'Get Commands', key: hash }, response => {
          if(!response) {
            //TODO: Set Loading... text + disable
            chrome.runtime.sendMessage({ action: 'Refresh Metadata', key: hash, cookie });
          } else {
            cmds = response;
          }
        });
      }

      switch(request.action) {
        case 'Render Labels':
          renderLabels(request.labels);
          break;

        case 'Refresh Metadata Success':
          cmds = request.commands;
          hideLoadingIndicator();
          break;

        case 'Show Command Bar':
          setVisibleSearch("visible");
          setVisible('visible');
          break;
      }
    }
  )

  var META_DATATYPES = {
    "AUTONUMBER": {name:"AutoNumber",code:"auto", params:0},
    "CHECKBOX": {name:"Checkbox",code:"cb", params:0},
    "CURRENCY": {name:"Currency",code:"curr", params:2},
    "DATE": {name:"Date",code:"d", params:0},
    "DATETIME": {name:"DateTime",code:"dt", params:0},
    "EMAIL": {name:"Email",code:"e", params:0},
    "FORMULA": {name:"FORMULA",code:"form"},
    "GEOLOCATION": {name:"Location",code:"geo"},
    "HIERARCHICALRELATIONSHIP": {name:"Hierarchy",code:"hr" },
    "LOOKUP": {name:"Lookup",code:"look"},
    "MASTERDETAIL": {name:"MasterDetail",code:"md"},
    "NUMBER": {name:"Number",code:"n"},
    "PERCENT": {name:"Percent",code:"per"},
    "PHONE": {name:"Phone",code:"ph"},
    "PICKLIST": {name:"Picklist",code:"pl"},
    "PICKLISTMS": {name:"MultiselectPicklist",code:"plms"},
    "ROLLUPSUMMARY": {name:"Summary",code:"rup"},
    "TEXT": {name:"Text",code:"t"},
    "TEXTENCRYPTED": {name:"EcryptedText",code:"te"},
    "TEXTAREA": {name:"TextArea",code:"ta"},
    "TEXTAREALONG": {name:"LongTextArea",code:"tal"},
    "TEXTAREARICH": {name:"Html",code:"tar"},
    "URL": {name:"Url",code:"url"}
  };

  /**
   * adds a bindGlobal method to Mousetrap that allows you to
   * bind specific keyboard shortcuts that will still work
   * inside a text input field
   *
   * usage:
   * Mousetrap.bindGlobal('ctrl+s', _saveChanges);
   */
  Mousetrap = (function(Mousetrap) {
    var _global_callbacks = {},
      _original_stop_callback = Mousetrap.stopCallback;

    Mousetrap.stopCallback = function(e, element, combo) {
      if (_global_callbacks[combo]) {
        return false;
      }

      return _original_stop_callback(e, element, combo);
    };

    Mousetrap.bindGlobal = function(keys, callback, action) {
      Mousetrap.bind(keys, callback, action);

      if (keys instanceof Array) {
        for (var i = 0; i < keys.length; i++) {
          _global_callbacks[keys[i]] = true;
        }
        return;
      }

      _global_callbacks[keys] = true;
    };

    return Mousetrap;
  }) (Mousetrap);

  var mouseHandler=
    function() {
      this.classList.add('litnav_selected');
      mouseClickLoginAsUserId = this.getAttribute("id");
      return true;
    }

  var mouseHandlerOut=
    function() {
      this.classList.remove('litnav_selected');
      return true;
    }

  var mouseClick=
    function() {
      let searchBar = document.getElementById("litnav_quickSearch");
      searchBar.value = this.firstChild.nodeValue;
      setVisible("hidden");
      posi = -1;
      oldins = this.firstChild.nodeValue;
      if (oldins == 'OrgLimits') {
        setVisibleSearch("visible");
        setVisible("visible");
      } else {
        setVisibleSearch("hidden");
        setVisible("hidden");
      }
      invokeCommand(this.firstChild.nodeValue,false,'click');
      clearOutput();
      searchBar.value = '';
      return true;
    }

  var mouseClickLoginAsUserId;
  var mouseClickLoginAs=
    function() {
      loginAsPerform(mouseClickLoginAsUserId);
      return true;
    }

  function addElements(ins)
  {
    if (ins.substring(0,9) == 'login as ')
      {

        clearOutput();
        outp.appendChild(addWord('Usage: login as <FirstName> <LastName> OR <Username>'));
        setVisible('visible');

      }
    else if (ins.substring(0,3) == 'cf ' && ins.split(' ').length < 4)
      {

        clearOutput();
        outp.appendChild(addWord('Usage: cf <Object API Name> <Field Name> <Data Type>'));
        setVisible('visible');

      }
    else if (ins.substring(0,3) == 'cf ' && ins.split(' ').length == 4)
      {
        clearOutput();
        var wordArray = ins.split(' ');

        words = getWord(wordArray[3], META_DATATYPES);
        var words2 = [];
        for (var i = 0; i<words.length; i++)
          {
            switch(words[i].toUpperCase())
            {
              case 'AUTONUMBER':
              words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
              break;
              case 'CHECKBOX':
              words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
              break;
              case 'CURRENCY':
              words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' <scale> <precision>') ;
              break;
              case 'DATE':
              words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
              break;
              case 'DATETIME':
              words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
              break;
              case 'EMAIL':
              words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
              break;
              case 'FORMULA':

              break;
              case 'GEOLOCATION':
              words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' <scale>');
              break;
              case 'HIERARCHICALRELATIONSHIP':

              break;
              case 'LOOKUP':
              words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' <lookup sObjectName>');
              break;
              case 'MASTERDETAIL':

              break;
              case 'NUMBER':
              words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' <scale> <precision>');
              break;
              case 'PERCENT':
              words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' <scale> <precision>');
              break;
              case 'PHONE':
              words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
              break;
              case 'PICKLIST':
              words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
              break;
              case 'PICKLISTMS':
              words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
              break;
              case 'ROLLUPSUMMARY':

              break;
              case 'TEXT':
              words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' <length>');
              break;
              case 'TEXTENCRYPTED':

              break;
              case 'TEXTAREA':
              words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
              break;
              case 'TEXTAREALONG':
              words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' <length> <visible lines>');
              break;
              case 'TEXTAREARICH':
              words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' <length> <visible lines>');
              break;
              case 'URL':
              words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
              break;

            }


          }
        if (words2.length > 0) {
          clearOutput();
          var docFragment = document.createDocumentFragment();
          for (var i=0;i<words2.length; ++i) {
            docFragment.appendChild(addWord (words2[i]));
          };
          outp.appendChild(docFragment);
          setVisible("visible");
          input = document.getElementById("litnav_quickSearch").value;
        }
        else {
          setVisible("hidden");
          posi = -1;
        }
        /*
           for (var i=0;i<Object.keys(META_DATATYPES).length;i++)
           {
           addWord(Object.keys(META_DATATYPES)[i]);
           }
         */
        setVisible('visible');
      }
    else if (ins.substring(0,3) == 'cf ' && ins.split(' ').length > 4)
      {
        clearOutput();
      }
    else
      {
        words = getWord(ins, cmds);

        if (words.length > 0) {
          clearOutput();
          var docFragment = document.createDocumentFragment();
          for (var i=0;i<words.length; ++i) {
            docFragment.appendChild(addWord (words[i]));
          };
          outp.appendChild(docFragment);
          setVisible("visible");
          input = document.getElementById("litnav_quickSearch").value;
        }
        else{
          clearOutput();
          setVisible("hidden");
          posi = -1;
        }
      }
    var firstEl = document.querySelector('#litnav_output :first-child');

    if (posi == -1 && firstEl != null) firstEl.className = "litnav_child litnav_selected"
  }

  function getVisible() {
    return document.getElementById("litnav_shadow").style.visibility;
  }
  function isVisible() {
    return document.getElementById("litnav_shadow").style.visibility !== 'hidden';
  }
  function setVisible(visi) {
    var x = document.getElementById("litnav_shadow");
    x.style.position = 'relative';
    x.style.visibility = visi;
  }
  function setLabelVis(visi) {
    var x = document.getElementById("litnav_labels");
    x.style.visibility = visi;
  }

  function isVisibleSearch() {
    return document.getElementById("litnav_quickSearch").style.visibility !== 'hidden';
  }
  function setVisibleSearch(visi)
  {
    var t = document.getElementById("litnav_search_box");
    t.style.visibility = visi;
    if (visi=='visible') document.getElementById("litnav_quickSearch").focus();
  }
  function setVisibleLabel(visi) {
    var t = document.getElementById("litnav_labels");
    t.style.visibility = visi;
    if (visi=='visible') document.getElementById("litnav_quickSearch").focus();
  }

  function lookAt() {
    let newSearchVal = document.getElementById('litnav_quickSearch').value
    if (newSearchVal !== '') {
      addElements(newSearchVal);
    }
    else{
      document.querySelector('#litnav_output').innerHTML = '';
      setVisible("hidden");
      posi = -1;
    }
  }
  function addWord(word) {
    var d = document.createElement("div");
    var sp;
    if (cmds[word] != null && cmds[word].url != null && cmds[word].url != "") {
      sp = document.createElement("a");
      sp.setAttribute("href", cmds[word].url);

    } else {
      sp = d;
    }

    if (cmds[word] != null && cmds[word].id != null && cmds[word].id != "") {
      sp.id = cmds[word].id;
    }

    sp.classList.add('litnav_child');
    sp.appendChild(document.createTextNode(word));
    sp.onmouseover = mouseHandler;
    sp.onmouseout = mouseHandlerOut;
    sp.onclick = mouseClick;
    if (sp.id && sp.length > 0) {
      sp.onclick = mouseClickLoginAs;
    }
    return sp;
  }

  function addSuccess(text)
  {
    clearOutput();
    var err = document.createElement("div");
    err.className = 'litnav_child litnav-success-wrapper';
    var errorText = '';
    err.appendChild(document.createTextNode('Success! '));
    err.appendChild(document.createElement('br'));
    var link = document.createElement('a');
    link.href = serverInstance + '/' + text.id;
    link.innerText = 'Field ' + text.id + ' created!';
    err.appendChild(link);
    outp.appendChild(err);

    setVisible("visible");
  }

  function addError(text)
  {
    clearOutput();
    var err = document.createElement("div");
    err.className = 'litnav_child litnav-error-wrapper';

    var errorText = '';
    err.appendChild(document.createTextNode('Error! '));
    err.appendChild(document.createElement('br'));
    for (var i = 0;i<text.length;i++)
      {
        err.appendChild(document.createTextNode(text[i].message));
        err.appendChild(document.createElement('br'));
      }

    /*
       var ta = document.createElement('textarea');
       ta.className = 'litnav-error-textarea';
       ta.value = JSON.stringify(text, null, 4);

       err.appendChild(ta);
     */
    outp.appendChild(err);

    setVisible("visible");
  }

  // faster clearing of output now
  function clearOutput() {
    if (typeof outp != 'undefined')
      var len = outp.childNodes.length;
      while (len--)
      {
        outp.removeChild(outp.lastChild);
      };
  }
  function getWord(beginning, dict) {
    var words = [];
    if (typeof beginning === 'undefined') return [];

    var tmpSplit = beginning.split(' ');
    var match = false;
    if (beginning.length == 0)
      {
        for (var key in dict)
          words.push(key);
        return words;
      }
    var arrFound = [];
    for (var key in dict)
      {
        match = false;
        if (key.toLowerCase().indexOf(beginning) != -1)
          {
            arrFound.push({num : 10,key : key});
          }
        else
          {
            for (var i = 0;i<tmpSplit.length;i++)
              {

                if (key.toLowerCase().indexOf(tmpSplit[i].toLowerCase()) != -1)
                  {
                    match = true;
                    sortValue = 1;
                  }
                else
                  {
                    match = false;
                    if (dict[key]['synonyms'] !== undefined) {
                      for (var j = 0;j<dict[key]['synonyms'].length;j++) {
                        keySynonym = dict[key]['synonyms'][j];
                        if (keySynonym.toLowerCase().indexOf(tmpSplit[i].toLowerCase()) != -1)
                          {
                            match = true;
                            sortValue = 0.5;
                          }
                      }
                    }
                  }

                if (!match)
                  {
                    break;
                  }
              }
            if (match) {
              arrFound.push({num : sortValue, key : key});
            }
          }
      }
    arrFound.sort(function(a,b) {
      return b.num - a.num;
    });
    for (var i = 0;i<arrFound.length;i++)
      words[words.length] = arrFound[i].key;

    return words;
  }

  function invokeCommand(cmd, newtab, event) {
    if (event != 'click' && typeof cmds[cmd] != 'undefined' && (cmds[cmd].url != null || cmds[cmd].url == ''))
      {
        if (newtab)
          {
            var w = window.open(cmds[cmd].url, '_newtab');
            w.blur();
            window.focus();
          } else {
            window.location.href = cmds[cmd].url;
          }

        return true;
      }
    if (cmd.toLowerCase() == 'refresh metadata')
      {
        chrome.runtime.sendMessage({ action: 'Refresh Metadata', key: hash, cookie });
        chrome.runtime.sendMessage({ action: 'Query Labels', key: hash, cookie });
        showLoadingIndicator();
        return true;
      }
    if (cmd.toLowerCase() == 'clabels')
      {
        chrome.runtime.sendMessage({ action: 'Get Labels', key: hash, cookie }, response => {
          if(chrome.runtime.lastError) {
            //TODO: Convert to same pattern as commands; sendResponse if no labels and then
            //send a new action to Refresh Labels. Checking lastError avoids a console error
            //for now
            console.log("Lighting Navigator > Fetching Labels");
          }
          
          if(response && response.labels) {
            renderLabels(response.labels);

            if (sort == null) {
              sort = true;
              sorttable.start();
            }
            setLabelVis('visible');
          }
        });
      }
    if (cmd.toLowerCase() == 'setup')
      {
        window.location.href = serverInstance + '/ui/setup/Setup';
        return true;
      }
    if (cmd.toLowerCase().substring(0,3) == 'cf ')
      {
        if (location.origin.indexOf("visual.force") !== -1) {
          document.getElementById('litnav_quickSearch').value = 'Creation failed: Inside VisualForce, try from Setup';
          clearOutput();
          return;
        } else if (location.origin.indexOf('lightning.force') !== -1) {
          document.getElementById('litnav_quickSearch').value = 'Creation failed: Does not work in Lightning, try in Classic';
          clearOutput();
          return;
        } else {
          document.getElementById('litnav_quickSearch').value = '';
        }
        createField(cmd);
        return true;
      }
    if (cmd.toLowerCase().substring(0,9) == 'login as ')
      {
        loginAs(cmd);
        return true;
      }
    if (cmd.toLowerCase() == 'orglimits')
      {
        if (location.origin.indexOf("visual.force") !== -1) {
          document.getElementById('litnav_quickSearch').value = 'Retrieval failed: Inside VisualForce, try from Setup';
          clearOutput();
          return;
        } else if (location.origin.indexOf('lightning.force') !== -1) {
          document.getElementById('litnav_quickSearch').value = 'Retrieval failed: Does not work in Lightning, try in Classic';
          clearOutput();
          return;
        } else {
          document.getElementById('litnav_quickSearch').value = '';
        }
        getLimits();
        return true;
      }
    return false;
  }

  function createField(cmd)
  {
    var arrSplit = cmd.split(' ');
    var dataType = '';
    var fieldMetadata;

    if (arrSplit.length >= 3)
      {
        dataType = META_DATATYPES[arrSplit[3].toUpperCase()].name;
        var sObjectName = arrSplit[1];
        var sObjectId = null;
        if (typeof customObjects[sObjectName.toLowerCase()] !== 'undefined')
          {
            sObjectId = customObjects[sObjectName.toLowerCase()].Id;
            sObjectName += '__c';
          }
        var fieldName = arrSplit[2];
        var helpText = null;
        var typeLength = arrSplit[4];
        var rightDecimals, leftDecimals;
        if (parseInt(arrSplit[5]) != NaN )
          {
            rightDecimals = parseInt(arrSplit[5]);
            leftDecimals = parseInt(typeLength);
          }
        else
          {
            leftDecimals = 0;
            rightDecimals = 0;
          }

        var fieldMeta;

        switch(arrSplit[3].toUpperCase())
        {
          case 'AUTONUMBER':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
          break;
          case 'CHECKBOX':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
          break;
          case 'CURRENCY':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, leftDecimals, rightDecimals,null,null,null);
          break;
          case 'DATE':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
          break;
          case 'DATETIME':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
          break;
          case 'EMAIL':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
          break;
          case 'FORMULA':

          break;
          case 'GEOLOCATION':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null, arrSplit[4],null,null,null);
          break;
          case 'HIERARCHICALRELATIONSHIP':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,arrSplit[4],null);
          break;
          case 'LOOKUP':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,arrSplit[4],null);
          break;
          case 'MASTERDETAIL':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,arrSplit[4],null);
          break;
          case 'NUMBER':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, leftDecimals, rightDecimals,null,null,null);
          break;
          case 'PERCENT':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, leftDecimals, rightDecimals,null,null,null);
          break;
          case 'PHONE':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
          break;
          case 'PICKLIST':
          var plVal = [];
          plVal.push(new forceTooling.CustomFields.PicklistValue('CHANGEME'));
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,plVal,null,null);
          break;
          case 'PICKLISTMS':
          var plVal = [];
          plVal.push(new forceTooling.CustomFields.PicklistValue('CHANGEME'));
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,plVal,null,null);
          break;
          case 'ROLLUPSUMMARY':

          break;
          case 'TEXT':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, typeLength, null,null,null,null,null);
          break;
          case 'TEXTENCRYPTED':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
          break;
          case 'TEXTAREA':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
          break;
          case 'TEXTAREALONG':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, typeLength, null,null,null,null,arrSplit[5]);
          break;
          case 'TEXTAREARICH':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, typeLength, null,null,null,null,arrSplit[5]);
          break;
          case 'URL':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
          break;

        }

        ftClient.setSessionToken(getCookie('sid'), SFAPI_VERSION, serverInstance + '');
        showLoadingIndicator();
        ftClient.create('CustomField', fieldMeta,
          function(success) {
            console.log(success);
            hideLoadingIndicator();
            addSuccess(success);
          },
          function(error) {
            console.log(error);
            hideLoadingIndicator();
            addError(error.responseJSON);
          });
      }

  }

  function loginAs(cmd) {
    var arrSplit = cmd.split(' ');
    var searchValue = arrSplit[2];
    if (arrSplit[3] !== undefined)
      searchValue += '+' + arrSplit[3];

    var query = 'SELECT+Id,+Name,+Username+FROM+User+WHERE+Name+LIKE+\'%25' + searchValue + '%25\'+OR+Username+LIKE+\'%25' + searchValue + '%25\'';
    console.log(query);

    ftClient.query(query,
      function(success) {
        console.log(success);
        var numberOfUserRecords = success.records.length;
        if (numberOfUserRecords < 1) {
          addError([{"message":"No user for your search exists."}]);
        } else if (numberOfUserRecords > 1) {
          loginAsShowOptions(success.records);
        } else {
          var userId = success.records[0].Id;
          loginAsPerform(userId);
        }
      },
      function(error)
      {
        console.log(error);
        addError(error.responseJSON);
      }
    );
  }

  function loginAsShowOptions(records) {
    var docFragment = document.createDocumentFragment();
    for (var i = 0; i < records.length; ++i) {
      var cmd = 'Login As ' + records[i].Name;
      cmds[cmd] = {key: cmd, id: records[i].Id};
      docFragment.appendChild(addWord(cmd));
    }
    outp.appendChild(docFragment);
    setVisible('visible');
  }

  function loginAsPerform(userId) {
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
        document.write(xmlhttp.responseText );
        document.close();
        setTimeout(function() {
          document.getElementsByName("login")[0].click();
        }, 1000);
      }
    }
    xmlhttp.open("GET", userDetailPage(userId), true);
    xmlhttp.send();
  }

  function userDetailPage(userId) {
    var loginLocation = window.location.protocol + '//' + window.location.host + '/' + userId + '?noredirect=1';
    console.log(loginLocation);
    return loginLocation;
  }

  function getLimits() {
    if (sid == null) {
      sid = "Bearer " + getCookie('sid');
    }
    var limitsUrl = getServerInstance() + '/services/data/v45.0/limits';
    var req = new XMLHttpRequest();
    req.open("GET", limitsUrl, true);
    req.setRequestHeader("Authorization", sid);
    req.onload = function(response) {
      parseLimits(response.target.responseText);
    }
    req.send();
  }

  function parseLimits(_data) {
    if (_data.length == 0) return;
    var properties = JSON.parse(_data);
    clearOutput();
    Object.keys(properties).forEach(function (limit) {
      addLimitInfo(limit, properties[limit].Remaining, properties[limit].Max);
    });
  }

  function addLimitInfo(limit, remaining, max) {
    var limitChild = document.createElement("div");
    limitChild.className = 'litnav_child';

    limitChild.appendChild(document.createTextNode(limit + ': ' + remaining + ' Remaining of ' + max + ' Max'));
    limitChild.appendChild(document.createElement('br'));
    outp.appendChild(limitChild);

    setVisible("visible");
  }

  function store(action, payload) {
    const req = {
      action,
      payload,
      key: hash
    };

    chrome.runtime.sendMessage(req);
  }

  function getCustomObjects()
  {
    var theurl = serverInstance + '/p/setup/custent/CustomObjectsPage';
    var req = new XMLHttpRequest();
    req.onload = function() {
      parseCustomObjectTree(this.response);
    }
    req.open("GET", theurl);
    req.responseType = 'document';

    req.send();
  }

  function parseCustomObjectTree(html)
  {

    $(html).find('th a').each(function(el) {
      cmds['Setup > Custom Object > ' + this.text] = {url: this.href, key: this.text};
    });

    store('Store Commands', cmds);
  }

  function getCookie()
  {
    return cookie.value;
  }

  function getServerInstance()
  {
    return`https://${cookie.domain}`;
  }

  function kbdCommand(e, key) {
    var position = posi;
    var origText = '', newText = '';
    if (position <0) position = 0;

    origText = document.getElementById("litnav_quickSearch").value;
    if (typeof outp.childNodes[position] != 'undefined')
    {
      newText = outp.childNodes[position].firstChild.nodeValue;
    }

    var newtab = newTabKeys.indexOf(key) >= 0 ? true : false;
    if (!newtab) {
      clearOutput();
      setVisible("hidden");
    }

    if (!invokeCommand(newText, newtab))
      invokeCommand(origText, newtab);
  }

  function selectMove(direction) {

    let searchBar = document.getElementById('litnav_quickSearch');

    var firstChild;

    if (outp.childNodes[posi] != null)
      firstChild = outp.childNodes[posi].firstChild.nodeValue;
    else
      firstChild = null;

    let textfield = searchBar;
    let isLastPos = direction == 'down' ? posi < words.length-1 : posi >= 0

    if (words.length > 0 && isLastPos) {
      if (posi < 0) posi = 0;
      posi = posi + (direction == 'down' ? 1 : -1);
      if (outp.childNodes[posi] != null)
        firstChild = outp.childNodes[posi].firstChild.nodeValue;
      else
        firstChild = null;
      if (posi >=0) {
        outp.childNodes[posi + (direction == 'down' ? -1 : 1) ].classList.remove('litnav_selected');
        outp.childNodes[posi].classList.add('litnav_selected');
        outp.childNodes[posi].scrollIntoViewIfNeeded();
        textfield.value = firstChild;
        return false
        //if (textfield.value.indexOf('<') != -1 && textfield.value.indexOf('>') != -1) {
          //textfield.setSelectionRange(textfield.value.indexOf('<'), textfield.value.length);
          //textfield.focus();
         // return false;
        //}
      }
    }
  }

  function setKeyboardBindings() {
    let searchBar = document.getElementById('litnav_quickSearch');

    Mousetrap.bindGlobal('esc', function(e) {
      if (isVisible() || isVisibleSearch()) {

        searchBar.blur();
        clearOutput();
        searchBar.value = '';

        setVisible("hidden");
        setVisibleSearch("hidden");
        setVisibleLabel("hidden");
      }
    });

    Mousetrap.wrap(searchBar).bind('enter', kbdCommand);
    newTabKeys.forEach(k => Mousetrap.wrap(searchBar).bind(k, kbdCommand));
    Mousetrap.wrap(searchBar).bind('down', selectMove.bind(this, 'down'));
    Mousetrap.wrap(searchBar).bind('up', selectMove.bind(this, 'up'));
    Mousetrap.wrap(searchBar).bind('backspace', () => {
      posi = -1;
      oldins=-1;
    });

    var timeout = null;

    searchBar.oninput = function() {
      clearTimeout(timeout);
      timeout = setTimeout(lookAt, 150);
      return true;
    }
  }

  function showLoadingIndicator()
  {
    let searchBar = document.getElementById("litnav_quickSearch");
    searchBar.value = "Loading...";
    searchBar.setAttribute("disabled","true");

    document.getElementById('litnav_loader').style.visibility = 'visible';
  }

  function hideLoadingIndicator()
  {
    let searchBar = document.getElementById("litnav_quickSearch");
    searchBar.value = "";
    searchBar.removeAttribute("disabled");

    document.getElementById('litnav_loader').style.visibility = 'hidden';

    if(searchBar.style.visibility !== 'hidden') {
      searchBar.focus();
    }
  }

  function createLabelDiv()
  {
    var labelDiv = document.createElement('div');
    labelDiv.setAttribute('id', 'litnav_labels');

    var labelsTabDiv = document.createElement('div');
    labelsTabDiv.setAttribute('class', 'litnav_labels_tab');

    var filterDiv = document.createElement('div');
    filterDiv.setAttribute('class', 'litnav_filter');

    var filterInput = document.createElement('input');
    filterInput.setAttribute('id', 'litnav_filter_input');
    filterInput.setAttribute('class', 'litnav_filter_input');
    filterInput.setAttribute('value', 'Filter');
    filterDiv.appendChild(filterInput);

    var allButton = document.createElement('button');
    allButton.setAttribute('id', 'all_button');
    allButton.setAttribute('class', 'tablinks');
    allButton.appendChild(document.createTextNode('All Namespaces'));

    labelsTabDiv.appendChild(filterDiv);
    labelsTabDiv.appendChild(allButton);
    labelDiv.appendChild(labelsTabDiv);

    var tabHolderDiv = document.createElement('div');
    tabHolderDiv.setAttribute('id', 'tabHolder');

    var tabContentDiv = document.createElement('div');
    tabContentDiv.setAttribute('id', 'All Namespaces');
    tabContentDiv.setAttribute('class', 'litnav_labels_tabcontent');

    var allNamespacesTable = document.createElement('table');
    allNamespacesTable.setAttribute('id', 'ltable-All Namespaces');
    allNamespacesTable.setAttribute('border', 0);
    allNamespacesTable.setAttribute('cellpadding', 0);
    allNamespacesTable.setAttribute('cellspacing', 0);
    allNamespacesTable.setAttribute('class', 'sortable');

    var col1 = document.createElement('col');
    col1.setAttribute('class', 'c1');
    allNamespacesTable.appendChild(col1);

    var col2 = document.createElement('col');
    col2.setAttribute('class', 'c2');
    allNamespacesTable.appendChild(col2);

    var col3 = document.createElement('col');
    col3.setAttribute('class', 'c3');
    allNamespacesTable.appendChild(col3);

    var col4 = document.createElement('col');
    col4.setAttribute('class', 'c4');
    allNamespacesTable.appendChild(col4);

    var col5 = document.createElement('col');
    col5.setAttribute('class', 'c5');
    allNamespacesTable.appendChild(col5);

    var sortableHead = document.createElement('thead');
    sortableHead.setAttribute('class', 'sortableColumns');

    var trHeader = document.createElement('tr');
    trHeader.setAttribute('id', 'header');
    trHeader.setAttribute('class', 'litnav_row_header');
    trHeader.setAttribute('style', 'background-color: rgb(255,255,255);');

    var thCat = document.createElement('th');
    thCat.appendChild(document.createTextNode('Category'));

    var thName = document.createElement('th');
    thName.appendChild(document.createTextNode('Name'));

    var thVal = document.createElement('th');
    thVal.appendChild(document.createTextNode('Value'));

    var thRec = document.createElement('th');
    thRec.appendChild(document.createTextNode('Record'));

    var thTrans = document.createElement('th');
    thTrans.appendChild(document.createTextNode('Translation'));

    trHeader.appendChild(thCat);
    trHeader.appendChild(thName);
    trHeader.appendChild(thVal);
    trHeader.appendChild(thRec);
    trHeader.appendChild(thTrans);

    sortableHead.appendChild(trHeader);
    allNamespacesTable.appendChild(sortableHead);

    var tbody = document.createElement('tbody');
    tbody.setAttribute('id', 'lbody-All Namespaces');
    allNamespacesTable.appendChild(tbody);
    allNamespacesTable.appendChild(document.createElement('tfoot'));

    tabContentDiv.appendChild(allNamespacesTable);
    tabHolderDiv.appendChild(tabContentDiv);

    labelDiv.appendChild(tabHolderDiv);
    return labelDiv;
  }

  function renderLabels(labels) {
    var labelDiv = document.getElementById('litnav_labels');

    if(labelDiv) {
      document.body.removeChild(labelDiv);
    }
      if (labels.length > 0) {
        document.body.appendChild(createLabelDiv());
        var filterInput = document.getElementById('litnav_filter_input');
        filterInput.onchange = function() {
          filterLabels(filterInput.value);
        }
        var button = document.getElementById('all_button');
        button.addEventListener('click', openTab);
        button.tabName = 'All Namespaces';

        outp = document.getElementById("litnav_output");
        labelp = document.getElementById("litnav_labels");

        labels.forEach( obj => {
          if (obj.attributes != null) {
            propRecord = obj.DeveloperName, obj.Id;
            var nameSpace = (obj.NamespacePrefix != null) ? obj.NamespacePrefix : 'Empty Namespace';
            var namespaceNode = document.getElementById('ltable-'+nameSpace);
            if (namespaceNode == null) {
              var node = document.createElement('div');
              node.setAttribute('id', nameSpace);
              node.setAttribute('class', 'litnav_labels_tabcontent');
              var table = document.createElement('table');
              table.setAttribute('id', 'ltable-' + nameSpace);
              table.setAttribute('class', 'sortable');
              var tableFrag = document.createDocumentFragment();
              var col1 = document.createElement('col');
              col1.setAttribute('class', 'c1');
              tableFrag.appendChild(col1);
              var col2 = document.createElement('col');
              col2.setAttribute('class', 'c2');
              tableFrag.appendChild(col2);
              var col3 = document.createElement('col');
              col3.setAttribute('class', 'c3');
              tableFrag.appendChild(col3);
              var col4 = document.createElement('col');
              col4.setAttribute('class', 'c4');
              tableFrag.appendChild(col4);
              var col5 = document.createElement('col');
              col5.setAttribute('class', 'c5');
              tableFrag.appendChild(col5);
              var col6 = document.createElement('col');
              col6.setAttribute('class', 'c6');
              tableFrag.appendChild(col6);
              var col7 = document.createElement('col');
              col7.setAttribute('class', 'c7');
              tableFrag.appendChild(col7);

              table.appendChild(tableFrag);

              var thead = document.createElement('thead');
              thead.setAttribute('class', 'sortableColumns');
              var headerRow = document.createElement('tr');
              headerRow.setAttribute('id', 'header');
              headerRow.setAttribute('class', 'litnav_row_header');
              headerRow.style.backgroundColor = '#ffffff';
              var headerFrag = document.createDocumentFragment();

              var headerCat = document.createElement('th');
              headerCat.appendChild(document.createTextNode('Category'));
              headerFrag.appendChild(headerCat);
              
              var headerName = document.createElement('th');
              headerName.appendChild(document.createTextNode('Name'));
              headerFrag.appendChild(headerName);
              
              var headerValue = document.createElement('th');
              headerValue.appendChild(document.createTextNode('Value'));
              headerFrag.appendChild(headerValue);

              var headerRecord = document.createElement('th');
              headerRecord.appendChild(document.createTextNode(' '));
              headerFrag.appendChild(headerRecord);

              var headerTranslate = document.createElement('th');
              headerTranslate.appendChild(document.createTextNode(' '));
              headerFrag.appendChild(headerTranslate);
              headerRow.appendChild(headerFrag);

              var headerMasterLabel = document.createElement('th');
              headerMasterLabel.innerHTML = '';
              headerRow.appendChild(headerMasterLabel);

              var headerNameSpace = document.createElement('th');
              headerNameSpace.innerHTML = '';
              headerRow.appendChild(headerNameSpace);

              thead.appendChild(headerRow);
              table.appendChild(thead);
              var tbody = document.createElement('tbody');
              tbody.setAttribute('id', 'lbody-' + nameSpace);
              table.appendChild(tbody);
              node.appendChild(table);

              tabHolder = document.getElementById('tabHolder');
              tabHolder.appendChild(node);

              var button = document.createElement('button');
              button.setAttribute('class','tablinks');
              button.addEventListener('click', openTab);
              button.tabName = nameSpace;
              button.appendChild(document.createTextNode(nameSpace));

              var tabClass = document.getElementsByClassName('litnav_labels_tab');
              tabClass[0].appendChild(button);
            }

            var row = document.createElement('tr');
            row.setAttribute('class', 'litnav_row');

            var catCell = document.createElement('td');
            catCell.appendChild(document.createTextNode((obj.Category != null) ? obj.Category : '(null)'));
            catCell.setAttribute('class', 'data');
            row.appendChild(catCell);
            
            var nameCell = document.createElement('td');
            nameCell.appendChild(document.createTextNode(obj.Name));
            nameCell.setAttribute('class', 'data');
            row.appendChild(nameCell);
            
            var valueCell = document.createElement('td');
            valueCell.appendChild(document.createTextNode(obj.Value));
            valueCell.setAttribute('class', 'data');
            row.appendChild(valueCell);

            var idCell = document.createElement('td');
            var recordAElement = document.createElement('a');
            recordAElement.setAttribute('class', 'litnav_labels');
            recordAElement.setAttribute('href', serverInstance + '/' + obj.Id);
            recordAElement.appendChild(document.createTextNode('Record'));
            idCell.appendChild(recordAElement);
            row.appendChild(idCell);

            var translateCell = document.createElement('td');
            var translateAElement = document.createElement('a');
            translateAElement.setAttribute('class', 'litnav_labels');
            translateAElement.setAttribute('href', serverInstance + '/01j/e?parentNmsp=' + nameSpace + '&retURL=%2F' + obj.Id + '&Parent=' + obj.Id);
            translateAElement.appendChild(document.createTextNode('Translate'));
            translateCell.appendChild(translateAElement);
            row.appendChild(translateCell);

            var masterLabelCell = document.createElement('td');
            masterLabelCell.innerHTML = obj.MasterLabel;
            masterLabelCell.setAttribute('hidden', 'true');
            row.appendChild(masterLabelCell);

            var namespaceCell = document.createElement('td');
            namespaceCell.innerHTML = obj.NamespacePrefix;
            namespaceCell.setAttribute('hidden', 'true');
            row.appendChild(namespaceCell);

            var bodyString = 'lbody-' + nameSpace;

            var labelBody = document.getElementById(bodyString);
            var allTable = document.getElementById('lbody-All Namespaces')
            labelBody.appendChild(row);
            allTable.appendChild(row.cloneNode(true));
          }
        });
        // Add button for Export at the end of the process
        if (document.getElementsByClassName('litnav_export').length == 0 ) {
          var button = document.createElement('button');
          button.setAttribute('class','litnav_export');
          button.addEventListener('click', downloadLabels);
          button.appendChild(document.createTextNode('Export To CSV'));
          var tabClass = document.getElementsByClassName('litnav_labels_tab');
          tabClass[0].appendChild(button);
        }
        if (document.getElementsByClassName('litnav_exportxliff').length == 0 ) {
          var button = document.createElement('button');
          button.setAttribute('class','litnav_exportxliff');
          button.addEventListener('click', downloadLabelsXliff);
          button.innerHTML = 'Export To XLIFF';
          var tabClass = document.getElementsByClassName('litnav_labels_tab');
          tabClass[0].appendChild(button);
        }
      }
  }

  function openTab(evt) {
    var tabName = evt.target.tabName;
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName('litnav_labels_tabcontent');
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = 'none';
    }
    tablinks = document.getElementsByClassName('tablinks');
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(' active', '');
    }
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';
  }

  function filterLabels(value) {
    var cells = document.getElementsByClassName('data');
    var rows = document.getElementById('tabHolder').getElementsByTagName('tr');
    var filteredRows = [];
    if (value != '') {
      for (i = 0; i < cells.length; i++) {
        if (cells[i].innerHTML.toLowerCase().includes(value.toLowerCase()) || cells[i].parentNode.parentNode.tagName.toLowerCase() == 'thead') {
          filteredRows.push(cells[i].parentNode);
        }
      }

      for (i = 0; i < rows.length; i++) {
        rows[i].style.display = 'none';
      }

      for (i = 0; i < filteredRows.length; i++) {
        filteredRows[i].style.display = '';
      }
    } else {
      for (i = 0; i < rows.length; i++) {
        rows[i].style.display = '';
      }
    }

    var headers = document.getElementsByClassName('litnav_row_header');
    for (i = 0; i < headers.length; i++) {
      headers[i].style.display = '';
    }
  }

  function downloadLabels() {
    var tablinks = document.getElementsByClassName('litnav_labels_tabcontent');
    var table_id;
    for (i = 0; i < tablinks.length; i++) {
      if (tablinks[i].style.display == 'block') {
        table_id = tablinks[i].id;
      }
    }

    var rows = document.getElementById('ltable-' + table_id).querySelectorAll('tr');
    var csv = [];
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].style.display != 'none') {  
        var row = [], cols = rows[i].querySelectorAll('td, th');
        for (var j = 0; j < 3; j++) {
          var data = cols[j].innerText.replace(/"/g, '""');
          row.push('"' + data + '"');
        }
        csv.push(row.join(';'));
      }
    }

    // Have to blob it, else large files won't DL properly
    var csv_string = csv.join('\n');
    var csvData = new Blob([csv_string], { type: 'text/csv' });
    var csvURL = URL.createObjectURL(csvData);

    var filename = 'export_' + table_id.replace(' ', '_') + '_' + new Date().toLocaleDateString() + '.csv';
    var link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute('href', csvURL);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadLabelsXliff() {
    var namespace = document.getElementsByClassName('tablinks active')[0].innerHTML;
    var tablinks = document.getElementsByClassName('litnav_labels_tabcontent');
    var table_id;
    for (i = 0; i < tablinks.length; i++) {
      if (tablinks[i].style.display == 'block') {
        table_id = tablinks[i].id;
      }
    }

    var rows = document.getElementById('ltable-' + table_id).querySelectorAll('tr');
    var xliff = [];
    xliff.push('<?xml version="1.0" encoding="UTF-8"?>');
    xliff.push('<xliff version="1.2">');
    xliff.push('    <file original="Salesforce" source-language="en_US" target-language="en_US" datatype="xml">');
    xliff.push('        <body>');
    for (var i = 1; i < rows.length; i++) {
      if (rows[i].style.display != 'none') {  
        var row = [], cols = rows[i].querySelectorAll('td, th');
        // Skip Category, init to 1
        xliff.push('            <trans-unit id="CustomLabel.' + cols[6].innerText + '__' + cols[1].innerText.replace(/"/g, '""') + '" maxwidth="1000" size-unit="char">');
        xliff.push('                <source>' + escapeHtml(cols[2].innerText) + '</source>');
        xliff.push('                <note>' + escapeHtml(cols[5].innerText) + '</note>');
        xliff.push('            </trans-unit>');
      }
    }

    // Wrap up the tail of the file.
    xliff.push('        </body>');
    xliff.push('    </file>');
    xliff.push('</xliff>');
    // Have to blob it, else large files won't DL properly
    var xliff_string = xliff.join('\n');
    var xliffData = new Blob([xliff_string], { type: 'text/xliff' });
    var xliffURL = URL.createObjectURL(xliffData);

    var filename = 'export_' + table_id.replace(' ', '_') + '_' + new Date().toLocaleDateString() + '.xlf';
    var link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute('href', xliffURL);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&apos;");
 }

  function init()
  {
    ftClient = new forceTooling.Client();
    ftClient.setSessionToken(getCookie('sid'), SFAPI_VERSION, serverInstance + '');

    var div = document.createElement('div');
    div.setAttribute('id', 'litnav_search_box');
    var loaderURL = chrome.extension.getURL("images/ajax-loader.gif");
    var logoURL = chrome.extension.getURL("images/ncino_128.png");
    var wrapperDiv = document.createElement('div');
    wrapperDiv.setAttribute('class', 'litnav_wrapper');
    
    var inputQuickSearch = document.createElement('input');
    inputQuickSearch.setAttribute('type', 'text');
    inputQuickSearch.setAttribute('id', 'litnav_quickSearch');
    inputQuickSearch.setAttribute('autocomplete', 'off');
    wrapperDiv.appendChild(inputQuickSearch);
    
    var loadImg = document.createElement('img');
    loadImg.setAttribute('id', 'litnav_loader');
    loadImg.setAttribute('src', loaderURL);
    wrapperDiv.appendChild(loadImg);

    var logoImg = document.createElement('img');
    logoImg.setAttribute('id', 'litnav_logo');
    logoImg.setAttribute('src', logoURL);
    wrapperDiv.appendChild(logoImg);
    div.appendChild(wrapperDiv);

    var shadowDiv = document.createElement('div');
    shadowDiv.setAttribute('class', 'litnav_shadow');
    shadowDiv.setAttribute('id', 'litnav_shadow');
    div.appendChild(shadowDiv);

    var outputDiv = document.createElement('div');
    outputDiv.setAttribute('class', 'litnav_output');
    outputDiv.setAttribute('id', 'litnav_output');
    div.appendChild(outputDiv);

    document.body.appendChild(div);

    outp = document.getElementById("litnav_output");
    labelp = document.getElementById("litnav_labels");

    hideLoadingIndicator();
    setKeyboardBindings();
  }
})();
