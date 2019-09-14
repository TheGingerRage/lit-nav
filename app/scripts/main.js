// @copyright 2012+ Daniel Nakov / Silverline CRM
// http://silverlinecrm.com
// @copyright 2018+ Bryan Mitchell / nCino
// http://ncino.com

chrome.runtime.sendMessage({ action: 'Loaded' });

var litnav = (function() {
  var cookie;

  chrome.runtime.onMessage.addListener(
    request => {
      if(request.cookie) {
        cookie = request.cookie;
        init();
      }
    }
  )

  var outp;
  var labelp;
  var tabHolder;
  var oldins;
  var posi = -1;
  var newTabKeys = [
    "ctrl+enter",
    "command+enter",
    "shift+enter"
  ]
  var input;
  var key;
  var metaData = {};
  var serverInstance = getServerInstance();
  var cmds = {};
  var isCtrl = false;
  var clientId, omnomnom, hash;
  var loaded=false;
  var shortcut;
  var sid;
  var sort;
  var SFAPI_VERSION = 'v33.0';
  var ftClient;
  var labelData = [];
  var customObjects = {};
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

  function getSingleObjectMetadata()
  {
    var recordId = document.URL.split('/')[3];
    var keyPrefix = recordId.substring(0,3);

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

  function httpGet(url, callback)
  {
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.setRequestHeader("Authorization", sid);
    req.onload = function(response) {
      callback(response);
    }
    req.send();
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
  function setColor (_posi, _color, _forg) {
    outp.childNodes[_posi].style.background = _color;
    outp.childNodes[_posi].style.color = _forg;
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
        let searchBar = document.getElementById("litnav_quickSearch");
        if (location.origin.indexOf("visual.force") !== -1) {
          // document.getElementById('sfnav_quickSearch').value = 'Refresh does not work in VisualForce, run from Setup';
          clearOutput();
          setVisible("hidden");
          chrome.runtime.sendMessage({action:'VisualForce Metadata', 'key': hash});

          setTimeout(function() { 
            chrome.runtime.sendMessage({
              action:'Get Commands', 'key': hash},
              function(response) {
                cmds = response;
              }
            );
            getCustomLabels();
            searchBar.value = '';
            setVisible("visible");
            renderLabels();
          }, 2000);
          return;
        }
        if (location.origin.indexOf('lightning.force') !== -1) {
          // document.getElementById('sfnav_quickSearch').value = 'Refresh does not work in Lightning, run in Classic Setup';
          clearOutput();
          setVisible("hidden");
          chrome.runtime.sendMessage({action:'Lightning Metadata', 'key': hash});

          setTimeout(function() { 
            chrome.runtime.sendMessage({
              action:'Get Commands', 'key': hash},
              function(response) {
                cmds = response;
              }
            );
            getCustomLabels();
            searchBar.value = '';
            setVisible("visible");
            renderLabels();
          }, 4000);

          return;
        }

        showLoadingIndicator();
        getAllObjectMetadata();
        setTimeout(function() {
          hideLoadingIndicator();
        }, 30000);
        return true;
      }
    if (cmd.toLowerCase() == 'clabels')
      {
        if (sort == null) {
          sort = true;
          sorttable.start();
        }
        setLabelVis('visible');
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

  function getMetadata(_data) {
    if (_data.length == 0) return;
    var metadata = JSON.parse(_data);

    var mRecord = {};
    var act = {};
    metaData = {};
    metadata.sobjects.map( obj => {

      if (obj.keyPrefix != null) {
        mRecord = {label, labelPlural, keyPrefix, urls} = obj;
        metaData[obj.keyPrefix] = mRecord;

        act = {
          key: obj.name,
          keyPrefix: obj.keyPrefix,
          url: serverInstance + '/' + obj.keyPrefix
        }
        if (mRecord.name.indexOf('__') != -1 && mRecord.name.indexOf('__') != mRecord.name.indexOf('__c')) {
          cmds['List ' + mRecord.labelPlural + ' (' + mRecord.name.split('__')[0] + ')'] = act;
          cmds['List ' + mRecord.labelPlural + ' (' + mRecord.name.split('__')[0] + ')']['synonyms'] = [obj.name];
        } else {
          cmds['List ' + mRecord.labelPlural] = act;
          cmds['List ' + mRecord.labelPlural]['synonyms'] = [obj.name];
        }
        act = {
          key: obj.name,
          keyPrefix: obj.keyPrefix,
          url: serverInstance + '/' + obj.keyPrefix + '/e',
        }
        cmds['New ' + mRecord.label] = act;
        cmds['New ' + mRecord.label]['synonyms'] = [obj.name];

      }
    })

    store('Store Commands', cmds);
    // store('Store Metadata', metaData)
  }

  function store(action, payload) {

    var req = {}
    req.action = action;
    req.key = hash;
    req.payload = payload;

    chrome.runtime.sendMessage(req, function(response) {

    });

    // var storagePayload = {};
    // storagePayload[action] = payload;
    // chrome.storage.local.set(storagePayload, function() {
    //     console.log('stored');
    // });
  }

  function getAllObjectMetadata() {
    sid = "Bearer " + getCookie('sid');
    var theurl = getServerInstance() + '/services/data/' + SFAPI_VERSION + '/sobjects/';

    cmds['Refresh Metadata'] = {};
    cmds['Setup'] = {};
    cmds['OrgLimits'] = {};
    cmds['clabels'] = {};
    var req = new XMLHttpRequest();
    req.open("GET", theurl, true);
    req.setRequestHeader("Authorization", sid);
    req.onload = function(response) {
      getMetadata(response.target.responseText);

    }
    req.send();

    getSetupTree();
    // getCustomObjects();
    getCustomObjectsDef();
    getApexClassesDef();
    getTriggersDef();
    getProfilesDef();
    getPagesDef();
    getUsersDef();
    getComponentsDef();
    getSysPropsNFORCEDef();
    getSysPropsLLCBIDef();
    getFlowsDef();
    getCustomLabels();
    renderLabels();
  }

  function parseSetupTree(html)
  {
    var textLeafSelector = '.setupLeaf > a[id*="_font"]';
    var all = html.querySelectorAll(textLeafSelector);
    var strName;
    var as;
    var strNameMain;
    var strName;
    [].map.call(all, function(item) {
      var hasTopParent = false, hasParent = false;
      var parent, topParent;
      var parentEl, topParentEl;

      if (item.parentElement != null && item.parentElement.parentElement != null && item.parentElement.parentElement.parentElement != null
          && item.parentElement.parentElement.parentElement.className.indexOf('parent') !== -1) {

        hasParent = true;
        parentEl = item.parentElement.parentElement.parentElement;
        parent = parentEl.querySelector('.setupFolder').innerText;
      }
      if (hasParent && parentEl.parentElement != null && parentEl.parentElement.parentElement != null
         && parentEl.parentElement.parentElement.className.indexOf('parent') !== -1) {
        hasTopParent = true;
        topParentEl = parentEl.parentElement.parentElement;
        topParent = topParentEl.querySelector('.setupFolder').innerText;
      }

      strNameMain = 'Setup > ' + (hasTopParent ? (topParent + ' > ') : '');
      strNameMain += (hasParent ? (parent + ' > ') : '');

      strName = strNameMain + item.innerText;

      if (cmds[strName] == null) cmds[strName] = {url: item.href, key: strName};

    });
    store('Store Commands', cmds);
  }

  function getSetupTree() {

    var theurl = serverInstance + '/ui/setup/Setup'
    var req = new XMLHttpRequest();
    req.onload = function() {
      parseSetupTree(this.response);
      hideLoadingIndicator();
    }
    req.open("GET", theurl);
    req.responseType = 'document';

    req.send();
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
    return cookie;
  }

  function getServerInstance()
  {
    var url = location.origin + "";
    var urlParseArray = url.split(".");
    var i;
    var returnUrl;

    if (url.indexOf("salesforce") != -1)
      {
        returnUrl = url.substring(0, url.indexOf("salesforce")) + "salesforce.com";
        return returnUrl;
      }
    if (url.indexOf("lightning.force") != -1)
      {
        returnUrl = url;
        return returnUrl;
      }
    if (url.indexOf("cloudforce") != -1)
      {
        returnUrl = url.substring(0, url.indexOf("cloudforce")) + "cloudforce.com";
        return returnUrl;
      }
    if (url.indexOf("visual.force") != -1)
      {
        returnUrl = 'https://' + urlParseArray[1] + '';
        return returnUrl;
      }
    return returnUrl;
  }

  function initShortcuts() {

    chrome.runtime.sendMessage({'action':'Get Settings'},
      function(response) {
        if (response !== undefined) {
          shortcut = response['shortcut'];
          bindShortcut(shortcut);
        }
      }
    );

    // chrome.storage.local.get('settings', function(results) {
    //     if (typeof results.settings.shortcut === 'undefined')
    //     {
    //         shortcut = 'shift+space';
    //         bindShortcut(shortcut);
    //     }
    //     else
    //     {
    //         bindShortcut(results.settings.shortcut);
    //     }
    // });
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

  function bindShortcut(shortcut) {

    let searchBar = document.getElementById('litnav_quickSearch');

    Mousetrap.bindGlobal(shortcut, function(e) {
      setVisibleSearch("visible");
      return false;
    });

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

    for (var i = 0; i < newTabKeys.length; i++) {
      Mousetrap.wrap(searchBar).bind(newTabKeys[i], kbdCommand);
    };

    Mousetrap.wrap(searchBar).bind('down', selectMove.bind(this, 'down'));

    Mousetrap.wrap(searchBar).bind('up', selectMove.bind(this, 'up'));

    Mousetrap.wrap(searchBar).bind('backspace', function(e) {
      posi = -1;
      oldins=-1;
    });

    var timeout = null;

    searchBar.oninput = function(e) {
      clearTimeout(timeout);

      timeout = setTimeout(function () {
        lookAt();  
      }, 150);
      return true;
    }

  }

  function showLoadingIndicator()
  {
    document.getElementById('litnav_loader').style.visibility = 'visible';
  }
  function hideLoadingIndicator()
  {
    document.getElementById('litnav_loader').style.visibility = 'hidden';
  }
  function getCustomObjectsDef()
  {
    var toolingUrl = getServerInstance() + '/services/data/v43.0/tooling/query/?q=SELECT+Id,+DeveloperName,+NamespacePrefix,+ManageableState+FROM+CustomObject';
    var req = new XMLHttpRequest();
    req.open("GET", toolingUrl, true);
    req.setRequestHeader("Authorization", sid);
    req.onload = function(response) {
      parseObjectDefs(response.target.responseText);
    }
    req.send();
  }
  function parseObjectDefs(_data) {
      if (_data.length == 0) {
        return;
      }
      var properties = JSON.parse(_data);
      if (properties.nextRecordsUrl != undefined) {
        var req = new XMLHttpRequest();
        req.open("GET", properties.nextRecordsUrl, true);
        req.setRequestHeader("Authorization", sid);
        req.onload = function(response) {
          parseObjectDefs(response.target.responseText);
        }
        req.send();
      }
      var action = {};
      if (properties.records) {
        properties.records.map( obj => {
          if (obj.attributes != null) {
            if (obj.ManageableState != 'unmanaged' || obj.NamespacePrefix == null) { 
              propRecord = obj.DeveloperName, obj.NamespacePrefix, obj.Id;
    
              action = {
                key: obj.DeveloperName,
                keyPrefix: obj.Id,
                url: serverInstance + '/' + obj.Id
              }
              var apiName = (obj.NamespacePrefix == null ? '' : obj.NamespacePrefix + '__') + obj.DeveloperName + '__c';
              cmds['Setup > Custom Object > ' + apiName] = action;
            }
          }
        });
        store('Store Commands', cmds);
      }
  }

  function getApexClassesDef() {
    ftClient.query('SELECT+Id,+Name,+NamespacePrefix+FROM+ApexClass',
    function(success)
    {
      for (var i=0;i<success.records.length;i++)
        {
          var apiName = (success.records[i].NamespacePrefix == null ? '' : success.records[i].NamespacePrefix + '__') + success.records[i].Name;
          cmds['Setup > Apex Class > ' + apiName] = {url: '/' + success.records[i].Id, key: apiName};
        }
    },
    function(error)
    {
      console.log('error while querying apex classes');
      console.log('error =>> ', error);
    });    
  }
  function getTriggersDef() {
    ftClient.query('SELECT+Id,+Name+FROM+ApexTrigger',
    function(success)
    {
      for (var i=0;i<success.records.length;i++)
        {
          var apiName = success.records[i].Name;
          cmds['Setup > Apex Trigger > ' + apiName] = {url: '/' + success.records[i].Id, key: apiName};
        }
    },
    function(error)
    {
      console.log('error while querying apex triggers');
      console.log('error =>> ', error);
    });
  }
  function getProfilesDef() {
    ftClient.query('SELECT+Id,+Name+FROM+Profile',
    function(success)
    {
      for (var i=0;i<success.records.length;i++)
        {
          var apiName = success.records[i].Name;
          cmds['Setup > Profile > ' + apiName] = {url: '/' + success.records[i].Id, key: apiName};
        }
    },
    function(error)
    {
      console.log('error while querying profiles');
      console.log('error =>> ', error);
    });   
  }
  function getPagesDef() {
    ftClient.query('SELECT+Id,+Name+FROM+ApexPage',
    function(success)
    {
      for (var i=0;i<success.records.length;i++)
        {
          var apiName = success.records[i].Name;
          cmds['Setup > Visualforce page > ' + apiName] = {url: '/' + success.records[i].Id, key: apiName};
        }
    },
    function(error)
    {
      console.log('error while querying visualforce pages');
      console.log('error =>> ', error);
    });
  }
  function getComponentsDef() {
    ftClient.query('SELECT+Id,+Name+FROM+ApexComponent',
    function(success)
    {
      for (var i=0;i<success.records.length;i++)
        {
          var apiName = success.records[i].Name;
          cmds['Setup > Visualforce component > ' + apiName] = {url: '/' + success.records[i].Id, key: apiName};
        }
    },
    function(error)
    {
      console.log('error while querying visualforce components');
      console.log('error =>> ', error);
    });
  }
  function getUsersDef() {
    ftClient.query('SELECT+Id,+Name+FROM+User',
    function(success)
    {
      for (var i=0;i<success.records.length;i++)
        {
          var apiName = success.records[i].Name;
          cmds['Setup > User > ' + apiName] = {url: '/' + success.records[i].Id + '?noredirect=1', key: apiName};
        }
    },
    function(error)
    {
      console.log('error while querying users');
      console.log('error =>> ', error);
    });
  }
  function getSysPropsNFORCEDef() {
    var theurl = getServerInstance() + '/services/data/' + SFAPI_VERSION 
      + '/query?q=SELECT+Id,+Name,+nFORCE__Category_Name__c,+nFORCE__Key__c+FROM+nFORCE__System_Properties__c';
    var req = new XMLHttpRequest();
    req.open("GET", theurl, true);
    req.setRequestHeader("Authorization", sid);
    req.onload = function(response) {
      parseSysPropsNFORCE(response.target.responseText);
    }
    req.send();
  }
  function parseSysPropsNFORCE(_data) {
    if (_data.length == 0) {
      return;
    }
    var properties = JSON.parse(_data);
    if (properties.nextRecordsUrl != undefined) {
      var req = new XMLHttpRequest();
      req.open("GET", properties.nextRecordsUrl, true);
      req.setRequestHeader("Authorization", sid);
      req.onload = function(response) {
        parseSysPropsNFORCE(response.target.responseText);
      }
      req.send();
    }
    var action = {};
    if (properties.records) {
      properties.records.map( obj => {
        if (obj.attributes != null) {
          propRecord = obj.nFORCE__Category_Name__c, obj.nFORCE__Key__c, obj.Name, obj.Id;

          action = {
            key: obj.name,
            keyPrefix: obj.Id,
            url: serverInstance + '/' + obj.Id + '?setupid=CustomSettings&isdtp=p1'
          }
          cmds['Setup > System Property (nFORCE) > ' + obj.nFORCE__Category_Name__c + ' > ' + obj.nFORCE__Key__c] = action;
        }
      });
      store('Store Commands', cmds);
    }
  }
  function getSysPropsLLCBIDef() {
    var theurl = getServerInstance() + '/services/data/' + SFAPI_VERSION 
      + '/query?q=SELECT+Id,+Name,+LLC_BI__Category_Name__c,+LLC_BI__Key__c+FROM+LLC_BI__System_Properties__c';
    var req = new XMLHttpRequest();
    req.open("GET", theurl, true);
    req.setRequestHeader("Authorization", sid);
    req.onload = function(response) {
      parseSysPropsLLCBI(response.target.responseText);
    }
    req.send();
  }
  function parseSysPropsLLCBI(_data) {
    if (_data.length == 0) {
      return;
    }
    var properties = JSON.parse(_data);
    if (properties.nextRecordsUrl != undefined) {
      var req = new XMLHttpRequest();
      req.open("GET", properties.nextRecordsUrl, true);
      req.setRequestHeader("Authorization", sid);
      req.onload = function(response) {
        parseSysPropsLLCBI(response.target.responseText);
      }
      req.send();
    }
    var action = {};
    if (properties.records) {
      properties.records.map( obj => {
        if (obj.attributes != null) {
          propRecord = obj.LLC_BI__Category_Name__c, obj.LLC_BI__Key__c, obj.Name, obj.Id;

          action = {
            key: obj.Name,
            keyPrefix: obj.Id,
            url: serverInstance + '/' + obj.Id + '?setupid=CustomSettings&isdtp=p1'
          }
          cmds['Setup > System Property (LLC_BI) > ' + obj.LLC_BI__Category_Name__c + ' > ' + obj.LLC_BI__Key__c] = action;
        }
      });
      store('Store Commands', cmds);
    }
  }
  function getFlowsDef() {
    var toolingUrl = getServerInstance() + '/services/data/v43.0/tooling/query/?q=SELECT+Id,+DeveloperName+FROM+FlowDefinition';
    var req = new XMLHttpRequest();
    req.open("GET", toolingUrl, true);
    req.setRequestHeader("Authorization", sid);
    req.onload = function(response) {
      parseFlows(response.target.responseText);
    }
    req.send();
  }
  function parseFlows(_data) {
    if (_data.length == 0) {
      return;
    }
    var properties = JSON.parse(_data);
    var action = {};
    if (properties.records) {
      properties.records.map( obj => {
        if (obj.attributes != null) {
          propRecord = obj.DeveloperName, obj.Id;

          action = {
            key: obj.DeveloperName,
            keyPrefix: obj.Id,
            url: serverInstance + '/' + obj.Id
          }
          cmds['Setup > Flow > ' + obj.DeveloperName] = action;
        }
      });
      store('Store Commands', cmds);
    }
  }
  function getCustomLabels() {
    if (sid == null) {
      sid = "Bearer " + getCookie('sid');
    }
    var toolingUrl = getServerInstance() + '/services/data/v43.0/tooling/query/?q=SELECT+Id,+Name,+Category,+Value,+NamespacePrefix+FROM+ExternalString+ORDER+BY+NamespacePrefix,+Category';
    var req = new XMLHttpRequest();
    req.open("GET", toolingUrl, true);
    req.setRequestHeader("Authorization", sid);
    req.onload = function(response) {
      parseLabels(response.target.responseText);
    }
    req.send();
  }

  function parseLabels(_data) {
    if (_data.length == 0) {
      return;
    }   
    var properties = JSON.parse(_data);
    labelData = labelData || [];
    labelData.push(properties.records);
    if (properties.nextRecordsUrl != undefined) {
      var req = new XMLHttpRequest();
      req.open("GET", properties.nextRecordsUrl, true);
      req.setRequestHeader("Authorization", sid);
      req.onload = function(response) {
        parseLabels(response.target.responseText);
      }
      req.send();
    }

    store('Store Labels', labelData);
  }

  function renderLabels() {
    chrome.runtime.sendMessage({
      action:'Get Labels', 'key': hash},
      function(response) {
        labelData = response;
        var properties = [];
        for (var i = 0; i < labelData.length; i++) {
          properties = properties.concat(labelData[i]);
        }
        if (properties) {
        properties.map( obj => {
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
              var col1 = document.createElement('col');
              col1.setAttribute('class', 'c1');
              table.appendChild(col1);
              var col2 = document.createElement('col');
              col2.setAttribute('class', 'c2');
              table.appendChild(col2);
              var col3 = document.createElement('col');
              col3.setAttribute('class', 'c3');
              table.appendChild(col3);
              var col4 = document.createElement('col');
              col4.setAttribute('class', 'c4');
              table.appendChild(col4);
              var col5 = document.createElement('col');
              col5.setAttribute('class', 'c5');
              table.appendChild(col5);
              var thead = document.createElement('thead');
              thead.setAttribute('class', 'sortableColumns');
              var headerRow = document.createElement('tr');
              headerRow.setAttribute('id', 'header');
              headerRow.setAttribute('class', 'litnav_row_header');
              headerRow.style.backgroundColor = '#ffffff';

              var headerCat = document.createElement('th');
              headerCat.innerHTML = 'Category';
              headerRow.appendChild(headerCat);
              
              var headerName = document.createElement('th');
              headerName.innerHTML = 'Name';
              headerRow.appendChild(headerName);
              
              var headerValue = document.createElement('th');
              headerValue.innerHTML = 'Value';
              headerRow.appendChild(headerValue);

              var headerRecord = document.createElement('th');
              headerRecord.innerHTML = ' ';
              headerRow.appendChild(headerRecord);

              var headerTranslate = document.createElement('th');
              headerTranslate.innerHTML = ' ';
              headerRow.appendChild(headerTranslate);

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
              button.innerHTML = nameSpace;

              var tabClass = document.getElementsByClassName('litnav_labels_tab');
              tabClass[0].appendChild(button);
            }

            var row = document.createElement('tr');
            row.setAttribute('class', 'litnav_row');

            var catCell = document.createElement('td');
            catCell.innerHTML = (obj.Category != null) ? obj.Category : '(null)';
            catCell.setAttribute('class', 'data');
            row.appendChild(catCell);
            
            var nameCell = document.createElement('td');
            nameCell.innerHTML = obj.Name;
            nameCell.setAttribute('class', 'data');
            row.appendChild(nameCell);
            
            var valueCell = document.createElement('td');
            valueCell.innerHTML = obj.Value;
            valueCell.setAttribute('class', 'data');
            row.appendChild(valueCell);

            var idCell = document.createElement('td');
            idCell.innerHTML = '<a class="litnav_labels" href="' + serverInstance + '/' + obj.Id + '">Record</a>';
            row.appendChild(idCell);

            var translateCell = document.createElement('td');
            translateCell.innerHTML = '<a class="litnav_labels" href="' + serverInstance + '/01j/e?parentNmsp=' + nameSpace + '&retURL=%2F' + obj.Id + '&Parent=' + obj.Id + '">Translate</a>';
            row.appendChild(translateCell);

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
          button.innerHTML = 'Export To CSV';
          var tabClass = document.getElementsByClassName('litnav_labels_tab');
          tabClass[0].appendChild(button);
        }
      }
    });
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

  function init()
  {
    ftClient = new forceTooling.Client();
    ftClient.setSessionToken(getCookie('sid'), SFAPI_VERSION, serverInstance + '');

    var div = document.createElement('div');
    div.setAttribute('id', 'litnav_search_box');
    var loaderURL = chrome.extension.getURL("images/ajax-loader.gif");
    var logoURL = chrome.extension.getURL("images/ncino_128.png");
    div.innerHTML = `
    <div class="litnav_wrapper">
      <input type="text" id="litnav_quickSearch" autocomplete="off"/>
      <img id="litnav_loader" src= "${loaderURL}"/>
      <img id="litnav_logo" src= "${logoURL}"/>
    </div>
    <div class="litnav_shadow" id="litnav_shadow"/>
    <div class="litnav_output" id="litnav_output"/>`;

    document.body.appendChild(div);

    var labelDiv = document.createElement('div');
    labelDiv.setAttribute('id', 'litnav_labels');
    labelDiv.innerHTML = `
      <div class="litnav_labels_tab">
        <div class="litnav_filter">
          <input id="litnav_filter_input" class="litnav_filter_input" value="Filter">
        </div>
        <button id="all_button" class="tablinks">All Namespaces</button>
      </div>
      <div id="tabHolder">
        <div id="All Namespaces" class="litnav_labels_tabcontent">
          <table id="ltable-All Namespaces" border="0" cellpadding="0" cellspacing="0" class="sortable">
            <col class="c1">
            <col class="c2">
            <col class="c3">
            <col class="c4">
            <col class="c5">
            <thead class="sortableColumns">
              <tr id="header" class="litnav_row_header" style="background-color: rgb(255, 255, 255);">
                <th>Category</th>
                <th>Name</th>
                <th>Value</th>
                <th>Record</th>
                <th>Translation</th>
              </tr>
            </thead>
            <tbody id="lbody-All Namespaces">
            </tbody>
            <tfoot>
            </tfoot>
          </table>
        </div>
      </div>`;
    document.body.appendChild(labelDiv);
    var filterInput = document.getElementById('litnav_filter_input');
    filterInput.onchange = function() {
      filterLabels(filterInput.value);
    }
    var button = document.getElementById('all_button');
    button.addEventListener('click', openTab);
    button.tabName = 'All Namespaces';

    outp = document.getElementById("litnav_output");
    labelp = document.getElementById("litnav_labels");
    hideLoadingIndicator();
    initShortcuts();

    omnomnom = getCookie('sid');

    clientId = omnomnom.split('!')[0];

    hash = clientId + '!' + omnomnom.substring(omnomnom.length - 10, omnomnom.length);
    
    // chrome.storage.local.get(['Commands','Metadata'], function(results) {
    //     console.log(results);
    // });

    chrome.runtime.sendMessage({
      action:'Get Commands', 'key': hash},
      function(response) {
        cmds = response;
        if (cmds == null || cmds.length == 0) {
          cmds = {};
          metaData = {};
          getAllObjectMetadata();
        } else {
          /// ???
        }

      });

    // chrome.runtime.sendMessage({action:'Get Metadata', 'key': hash},
    //   function(response) {
    //     metaData = response;
    // });

  }
})();
