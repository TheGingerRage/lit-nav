var commands = {};
var metadata = {};
var lastUpdated = {};
var labels = {};
let tab = null;

const excludedDomains = ['visual.force.com', 'content.force.com', 'lightning.force.com'];

const getFilteredCookies = (allCookies, filter) => {
    return allCookies.filter(
        c => c.domain.startsWith(filter) && !excludedDomains.some(d => c.domain.endsWith(d))
    );
};

chrome.browserAction.onClicked.addListener(function() {
    chrome.browserAction.setPopup({ popup: 'popup.html' });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var orgKey = request.key != null ? request.key.split('!')[0] : null;

    if (request.action === 'Loaded') {
        tab = sender.tab;
        const orgDomain = sender.tab.url.replace(/https?:\/\/(.*\.com).*/, '$1');
        const parts = orgDomain.split('.');

        if (parts.length > 0) {
            let orgName = parts[0].replace(/--.*/, '');

            chrome.cookies.getAll({ name: 'sid' }, allCookies => {
                let possibleCookies = getFilteredCookies(allCookies, orgName);

                if (possibleCookies.length === 0 && parts.length > 1) {
                    orgName = parts[1].replace(/--.*/, '');
                    possibleCookies = getFilteredCookies(allCookies, orgName);
                }

                if (possibleCookies.length > 0) {
                    cookie = possibleCookies[0].value;
                    chrome.tabs.sendMessage(sender.tab.id, { cookie });
                }
            });
        }
    }

    if (request.action == 'Store Commands') {
        Object.keys(commands).forEach(function(key) {
            if (key != request.key && key.split('!')[0] == orgKey) delete commands[key];
        });
        commands[request.key] = commands[orgKey] = request.payload;
        lastUpdated[orgKey] = new Date();
        sendResponse({});
    }
    if (request.action == 'Get Commands') {
        if (commands[request.key] != null) sendResponse(commands[request.key]);
        else if (
            commands[orgKey] != null &&
            lastUpdated[orgKey] != null &&
            new Date().getTime() - lastUpdated[orgKey].getTime() < 1000 * 60 * 60
        )
            sendResponse(commands[orgKey]);
        else sendResponse(null);
    }
    if (request.action == 'Get Settings') {
        var settings = localStorage.getItem('litnav_settings');

        if (settings != null) {
            sendResponse(JSON.parse(settings));
        } else {
            var sett = {};
            sett['shortcut'] = 'ctrl+shift+space';
            localStorage.setItem('litnav_settings', JSON.stringify(sett));
            sendResponse(sett);
        }
    }
    if (request.action == 'Set Settings') {
        var settings = localStorage.getItem('litnav_settings');
        if (settings != null) {
            var sett = JSON.parse(settings);
            sett[request.key] = request.payload;
            localStorage.setItem('litnav_settings', JSON.stringify(sett));
        }
        sendResponse({});
    }
    if (request.action == 'Store Metadata') {
        Object.keys(metadata).forEach(function(key) {
            if (key != request.key && key.split('!')[0] == orgKey) delete metadata[key];
        });
        metadata[request.key] = metadata[orgKey] = request.payload;
        sendResponse({});
    }
    if (request.action == 'Get Metadata') {
        if (metadata[request.key] != null) sendResponse(metadata[request.key]);
        else if (metadata[orgKey] != null) sendResponse(metadata[orgKey]);
        else sendResponse(null);
    }
    if (request.action == 'Store Labels') {
        Object.keys(labels).forEach(function(key) {
            if (key != request.key && key.split('!')[0] == orgKey) delete labels[key];
        });
        labels[request.key] = labels[orgKey] = request.payload;
        sendResponse({});
    }
    if (request.action == 'Get Labels') {
        if (labels[request.key] != null) sendResponse(labels[request.key]);
        else if (labels[orgKey] != null) sendResponse(labels[orgKey]);
        else sendResponse(null);
    }
    if (request.action == 'Lightning Metadata') {
        var newLocation = sender.tab.url.split('/lightning')[0] + '/ui/setup/Setup';
        chrome.tabs.create({ url: newLocation, active: false }, function(tab) {
            setTimeout(function() {
                chrome.tabs.remove(tab.id, function() {});
            }, 4000);
        });

        sendResponse(null);
    }
    if (request.action == 'VisualForce Metadata') {
        var newLocation =
            sender.tab.url.split('--')[0] +
            '--' +
            sender.tab.url.split('--')[1] +
            '.' +
            sender.tab.url.split('--')[2].split('.')[1] +
            '.cloudforce.com/ui/setup/Setup';
        chrome.tabs.create({ url: newLocation, active: false }, function(tab) {
            setTimeout(function() {
                chrome.tabs.remove(tab.id, function() {});
            }, 4000);
        });

        sendResponse(null);
    }
});
