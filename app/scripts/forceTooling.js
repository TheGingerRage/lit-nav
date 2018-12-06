/*
 * Copyright (c) 2011, salesforce.com, inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the
 * following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
 * promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

/* JavaScript library to wrap REST API on Visualforce. Leverages Ajax Proxy
 * (see http://bit.ly/sforce_ajax_proxy for details).
 *
 * Note that you must add the REST endpoint hostname for your instance (i.e.
 * https://na1.salesforce.com/ or similar) as a remote site - in the admin
 * console, go to Your Name | Setup | Security Controls | Remote Site Settings
 */

var forceTooling = window.forceTooling;

if (forceTooling === undefined) {
  forceTooling = {};
}

if (forceTooling.ApexLogs === undefined) {
  forceTooling.ApexLogs = {};

  forceTooling.ApexLogs.queryString = 'SELECT Id,Application,DurationMilliseconds,Location,LogLength,LogUserId,Operation,Request,StartTime,Status FROM ApexLog';
}

if (forceTooling.CustomFields === undefined) {
  forceTooling.CustomFields = {};

  // The main wrapper that needs to be an input to the create method.
  // Right now, the constructor for this takes a reasonable amount of inputs.
  // Need to add some new parameters to this to allow for creating things like
  //    relationship fields and a few other more complex field types.
  forceTooling.CustomFields.CustomField =  function(sobject,sobjectId, name,type,helpText,length,leftDecimals,rightDecimals,picklistValues, referenceTo, visibleLines){
    this.Metadata = new forceTooling.CustomFields.Metadata(name,sobject,type,helpText,length,leftDecimals,rightDecimals,picklistValues, referenceTo, visibleLines);
    this.FullName = sobject + '.' + this.Metadata.fullName;
    // if(sobjectId === null) this.TableEnumOrId = sobject;
    // else this.TableEnumOrId = sobjectId;
  };

  // Should be instantiated as new Metadata(fieldName or label,forceTooling.CustomFields.TYPES,a string of helptext, the length As Integer(for text fields), # of decimals to the left, # of decimals to the right)
  // Most of the fields that are possible will probably never be used. That doesn't mean we should never create a constructor for all these fields.
  forceTooling.CustomFields.Metadata = function(name,sobject, type,helpText,length,leftDecimals,rightDecimals,picklistValues, referenceTo, visibleLines){
    var tempName = name;
    if(name.toLowerCase().substring(name.length-3,name.length) == "__c")
    {
      this.fullName = name;

      tempName = name.replace("__c","");
      tempName = tempName.replace("__C","");
      tempName = tempName.replace("_"," ");
      this.label = tempName;
    }
    else
    {
      this.label = name;
      tempName = name.replace(" ","_");
      tempName += "__c";
      this.fullName = tempName;
    }
    this.type = type;
    this.inlineHelpText = helpText;
    this.length = parseInt(length);
    if(this.precision != null) this.precision = parseInt(leftDecimals + rightDecimals);
    this.scale = rightDecimals;
    if(picklistValues !== null)
    {
      this.picklist = { sorted: false, restrictedPicklist: null, controllingField: null};
      this.picklist.picklistValues = picklistValues;
    }

    // unused booleans
    this.caseSensitive = false;
    this.deprecated = false;
    this.displayLocationInDecimal = false;
    this.externalId = false;
    this.indexed = false;
    this.populateExistingRows = false;
    this.reparentableMasterDetail = false;
    this.stripMarkup = false;
    this.trackFeedHistory = false;
    this.trackHistory = false;
    this.trueValueIndexed = false;
    this.unique = false;
    this.writeRequiresMasterRead = false;

    // unused ints
    // this.relationshipOrder = 0;
    // this.startingNumber = 0;
    if(visibleLines != null) this.visibleLines = visibleLines;

    // unused strings
    if(this.type == 'Checkbox') this.defaultValue = false;

    if(referenceTo != null) this.deleteConstraint = 'SetNull';
    this.description = null;
    this.displayFormat = null;
    this.formula = null;
//    this.formulaTreatBlankAs = null;
    this.maskChar = null;
    this.maskType = null;
    this.referenceTo = referenceTo;
    if(referenceTo != null) this.relationshipLabel = sobject;
    if(referenceTo != null) this.relationshipName = sobject;
    this.summarizedField = null;
    this.summaryForeignKey = null;
    this.summaryOperation = null;
  };

  // For future use:
  // Should create an array of forceTooling.CustomFields.PicklistValues to pass as an input to Metadata.
  // Right now, all the fields seem semi-useless except for name.
  // we can't set the default value because it's a reserved word.
  forceTooling.CustomFields.PicklistValue = function(name){
    this.fullName = name;

    //booleans
    this.allowEmail = null;
    this.closed = null;
    this.converted = null;
    this.cssExposed = null;
    this.highPriority = null;
    this.reviewed = false;
    this.won = null;
    this.probability = null;

    //string fields
    this.forecastCategory = null;
    this.color = null;
    this.description = null;
    this.reverseRole = null;
    this.controllingFieldValues = null;
  };

  // Holds the default query string for Custom fields.
  forceTooling.CustomFields.queryString = 'Select  Id, DeveloperName, NamespacePrefix, TableEnumOrId, Fullname, Metadata FROM CustomField';

  // an object to hold all the salesforce custom field types. the name attribute is the exact salesforce name.
  forceTooling.CustomFields.TYPES = {
    AUTONUMBER : {name:"AutoNumber",code:"auto"},
    CHECKBOX : {name:"Checkbox",code:"cb"},
    CURRENCY : {name:"Currency",code:"curr"},
    DATE : {name:"Date",code:"d"},
    DATETIME : {name:"DateTime",code:"dt"},
    EMAIL : {name:"Email",code:"e"},
    FORMULA : {name:"FORMULA",code:"form"},
    GEOLOCATION : {name:"Location",code:"geo"},
    HIERARCHICALRELATIONSHIP : {name:"Hierarchy",code:"hr"},
    LOOKUPRELATIONSHIP : {name:"Lookup",code:"look"},
    MASTERDETAILRELATIONSHIP : {name:"MasterDetail",code:"md"},
    NUMBER : {name:"Number",code:"n"},
    PERCENT : {name:"Percent",code:"per"},
    PHONE : {name:"Phone",code:"ph"},
    PICKLIST : {name:"Picklist",code:"pl"},
    PICKLISTMS : {name:"MultiselectPicklist",code:"plms"},
    ROLLUPSUMMARY : {name:"Summary",code:"rup"},
    TEXT : {name:"Text",code:"t"},
    TEXTENCRYPTED : {name:"EcryptedText",code:"te"},
    TEXTAREA : {name:"TextArea",code:"ta"},
    TEXTAREALONG : {name:"LongTextArea",code:"tal"},
    TEXTAREARICH : {name:"Html",code:"tar"},
    URL : {name:"Url",code:"url"}
  };
}

if (forceTooling.Client === undefined) {
  // We use $j rather than $ for jQuery so it works in Visualforce
  if (window.$j === undefined) {
    $j = $;
  }

  /**
   * The Client provides a convenient wrapper for the Force.com REST API,
   * allowing JavaScript in Visualforce pages to use the API via the Ajax Proxy.
   * @param [clientId=null] 'Consumer Key' in the Remote Access app settings
   * @param [loginUrl='https://login.salesforce.com/'] Login endpoint
   * @param [proxyUrl=null] Proxy URL. Omit if running on Visualforce or PhoneGap etc
   * @constructor
   */
  forceTooling.Client = function(clientId, loginUrl, proxyUrl) {
    this.clientId = clientId;
    this.loginUrl = loginUrl || 'https://login.salesforce.com/';
    if (typeof proxyUrl === 'undefined' || proxyUrl === null) {
      if (location.protocol === 'file:') {
        // In PhoneGap
        this.proxyUrl = null;
      } else {
        // In Visualforce
        this.proxyUrl = location.protocol + "//" + location.hostname + "/services/proxy";
      }
      this.authzHeader = "Authorization";
      } else {
      // On a server outside VF
      this.proxyUrl = proxyUrl;
      this.authzHeader = "X-Authorization";
    }
    this.refreshToken = null;
    this.sessionId = null;
    this.apiVersion = null;
    this.instanceUrl = null;
    this.asyncAjax = true;
  };

  /**
   * Set a refresh token in the client.
   * @param refreshToken an OAuth refresh token
   */
  forceTooling.Client.prototype.setRefreshToken = function(refreshToken) {
    this.refreshToken = refreshToken;
  };

  /**
   * Refresh the access token.
   * @param callback function to call on success
   * @param error function to call on failure
   */
  forceTooling.Client.prototype.refreshAccessToken = function(callback, error) {
    var that = this;
    var url = this.loginUrl + '/services/oauth2/token';
    return $j.ajax({
      type: 'POST',
      url: (this.proxyUrl !== null) ? this.proxyUrl: url,
      cache: false,
      processData: false,
      data: 'grant_type=refresh_token&client_id=' + this.clientId + '&refresh_token=' + this.refreshToken,
      success: callback,
      error: error,
      dataType: "json",
      beforeSend: function(xhr) {
        if (that.proxyUrl !== null) {
          xhr.setRequestHeader('SalesforceProxy-Endpoint', url);
        }
      }
    });
   };

  /**
   * Set a session token and the associated metadata in the client.
   * @param sessionId a salesforce.com session ID. In a Visualforce page,
   *                   use '{!$Api.sessionId}' to obtain a session ID.
   * @param [apiVersion="21.0"] Force.com API version
   * @param [instanceUrl] Omit this if running on Visualforce; otherwise
   *                   use the value from the OAuth token.
   */
  forceTooling.Client.prototype.setSessionToken = function(sessionId, apiVersion, instanceUrl) {
    this.sessionId = sessionId;
    this.apiVersion = (typeof apiVersion === 'undefined' || apiVersion === null) ? 'v27.0': apiVersion;
    if (typeof instanceUrl === 'undefined' || instanceUrl === null) {
          // location.hostname can be of the form 'abc.na1.visual.force.com',
          // 'na1.salesforce.com' or 'abc.my.salesforce.com' (custom domains).
          // Split on '.', and take the [1] or [0] element as appropriate
          var elements = location.hostname.split(".");

          var instance = null;
          if(elements.length == 4 && elements[1] === 'my') {
            instance = elements[0] + '.' + elements[1];
          } else if(elements.length == 3){
            instance = elements[0];
          } else {
            instance = elements[1];
          }

          this.instanceUrl = "https://" + instance + ".salesforce.com";
    }
    else {
      this.instanceUrl = instanceUrl;
    }
  };

  /*
   * Low level utility function to call the Salesforce endpoint.
   * @param path resource path relative to /services/data
   * @param callback function to which response will be passed
   * @param [error=null] function to which jqXHR will be passed in case of error
   * @param [method="GET"] HTTP method for call
   * @param [payload=null] payload for POST/PATCH etc
   */
  forceTooling.Client.prototype.ajax = function(path, callback, error, method, payload, retry) {
    var that = this;
    var url = this.instanceUrl + '/services/data' + path;

    return $j.ajax({
      type: method || "GET",
      async: this.asyncAjax,
      url: (this.proxyUrl !== null) ? this.proxyUrl: url,
      contentType: method == "DELETE"  ? null : 'application/json',
      cache: false,
      processData: false,
      data: payload,
      success: callback,
      error: (!this.refreshToken || retry ) ? error : function(jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 401) {
          that.refreshAccessToken(function(oauthResponse) {
            that.setSessionToken(oauthResponse.access_token, null,
              oauthResponse.instance_url);
            that.ajax(path, callback, error, method, payload, true);
          },
          error);
        } else {
          error(jqXHR, textStatus, errorThrown);
        }
      },
      dataType: "json",
      beforeSend: function(xhr) {
        if (that.proxyUrl !== null) {
          xhr.setRequestHeader('SalesforceProxy-Endpoint', url);
        }
        xhr.setRequestHeader(that.authzHeader, "OAuth " + that.sessionId);
        xhr.setRequestHeader('X-User-Agent', 'salesforce-toolkit-rest-javascript/' + that.apiVersion);
      }
    });
  };

  /*
   * Low level utility function to call the Salesforce endpoint specific for Apex REST API.
   * @param path resource path relative to /services/apexrest
   * @param callback function to which response will be passed
   * @param [error=null] function to which jqXHR will be passed in case of error
   * @param [method="GET"] HTTP method for call
   * @param [payload=null] payload for POST/PATCH etc
   * @param [paramMap={}] parameters to send as header values for POST/PATCH etc
   * @param [retry] specifies whether to retry on error
   */
   forceTooling.Client.prototype.apexrest = function(path, callback, error, method, payload, paramMap, retry) {
    var that = this;
    var url = this.instanceUrl + '/services/apexrest' + path;

    return $j.ajax({
      type: method || "GET",
      async: this.asyncAjax,
      url: (this.proxyUrl !== null) ? this.proxyUrl: url,
      contentType: 'application/json',
      cache: false,
      processData: false,
      data: payload,
      success: callback,
      error: (!this.refreshToken || retry ) ? error : function(jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 401) {
          that.refreshAccessToken(function(oauthResponse) {
            that.setSessionToken(oauthResponse.access_token, null,
              oauthResponse.instance_url);
            that.apexrest(path, callback, error, method, payload, paramMap, true);
          },
          error);
        } else {
          error(jqXHR, textStatus, errorThrown);
        }
      },
      dataType: "json",
      beforeSend: function(xhr) {
        if (that.proxyUrl !== null) {
          xhr.setRequestHeader('SalesforceProxy-Endpoint', url);
        }
        //Add any custom headers
        if (paramMap === null) {
          paramMap = {};
        }
        for (var paramName in paramMap) {
          xhr.setRequestHeader(paramName, paramMap[paramName]);
        }
        xhr.setRequestHeader(that.authzHeader, "OAuth " + that.sessionId);
        xhr.setRequestHeader('X-User-Agent', 'salesforce-toolkit-rest-javascript/' + that.apiVersion);
      }
    });
  };

  // Create
  forceTooling.Client.prototype.create = function(metaDataType, payload, callback, error) {
    return this.ajax('/' + this.apiVersion + '/tooling/sobjects/' + metaDataType + '/', callback, error, "POST", JSON.stringify(payload));
  };

  // Update
  forceTooling.Client.prototype.update = function(metaDataType, id, payload, callback, error) {
    return this.ajax('/' + this.apiVersion + '/tooling/sobjects/' + metaDataType + '/' + id + '?_HttpMethod=PATCH', callback, error, "POST", JSON.stringify(payload));
  };

  // query
  forceTooling.Client.prototype.query = function(queryString, callback, error) {
    return this.ajax('/' + this.apiVersion + '/tooling/query/?q=' + queryString, callback, error);
  };

  // queryFieldsByName
  forceTooling.Client.prototype.queryFieldsByName = function(name, callback, error) {
    var queryString = forceTooling.CustomFields.queryString + ' WHERE Fullname=\'' + name + '\'';
    return forceTooling.Client.prototype.query(this.queryString,callback,error);
  };

  // queryFieldsById
  forceTooling.Client.prototype.queryFieldsById = function(id, callback, error) {
    var queryString = forceTooling.CustomFields.queryString + ' WHERE Id=\'' + id + '\'';
    return forceTooling.Client.prototype.query(this.queryString,callback,error);
  };

  // queryFieldsForObject
  forceTooling.Client.prototype.queryFieldsForObject = function(objectName, callback, error) {
    var queryString = forceTooling.CustomFields.queryString + ' WHERE TableEnumOrId=\'' + objectName + '\'';
    return forceTooling.Client.prototype.query(this.queryString,callback,error);
  };

  // queryLogsById
  forceTooling.Client.prototype.queryLogsById = function(id, callback, error) {
    return this.ajax('/' + this.apiVersion + '/tooling/sobjects/ApexLog/'+ id);
  };

  // queryLogsById
  forceTooling.Client.prototype.queryLogsByUserId = function(userId, callback, error) {
    var queryString = forceTooling.ApexLogs.queryString + ' WHERE LogUserId=\'' + userId + '\'';
    return forceTooling.Client.prototype.query(this.queryString,callback,error);
  };

  // queryLogBodyByLogId
  forceTooling.Client.prototype.queryLogBodyByLogId = function(id, callback, error) {
    return this.ajax('/' + this.apiVersion + '/tooling/sobjects/ApexLog/'+ id +'/Body/');
  };

}
