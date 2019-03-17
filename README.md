# Lightning Navigator

This extension helps you get to any Salesforce page quickly. Just type in what you need to do.

- All objects list views and create new pages are available (even for objects that don't have tabs). Type in "List <Object Name>" or "New <Object Name>"

- All setup links are available -- Type in "Setup" to see all. For example, if you want to get to the Account fields setup, type in "Account Fields". Or any custom object setup page, type "setup <Custom Object Name>"

- Thanks to the SF tooling API, you can now create fields. "cf Account newField TEXT 100."

- The original Salesforce Navigator was seemingly abandoned. I added the little bit needed to support Lightning. I renamed it to prevent confusion on the Chrome Store, and as I maintain the project moving forward.

- Run "Refresh Metadata" from Lightning Navigator in Salesforce Classic. From that point you can navigate and use the extenion from Lightning.

## New features added this version

- Type in "orglimits" and press enter to see the current Org Limits displayed below in a scrollable list. Delete "orglimits" to return to using Lightning Navigator normally.

- Added navigation to the following by name: Apex Classes, Apex Triggers, Apex Pages, Users, Profiles, VisualForce Pages, VisualForce Components, Flows

- Added navigation to nForce and LLC_BI System Properties by Category and Key (eg: Setup > System Property (nFORCE) > document manager > archive_browser_visible)

## Bug Fixes and Other Cleanup

- Refresh Metadata won't glitch out on VF pages causing the extension to fill up with "undefined"

- Refresh Metadata also elgeantly fails in Lightning now, rather than showing a loading indicator for a minute then doing nothing.

- Cleaned up some DOM interaction with appendChild/removeChild calls being mishandled

- Cleaned up some spacing and casing stuff that bugged me

## Getting Started
Project was scaffolded using [Yeoman](http://yeoman.io/) using [generator-chrome-extension](https://github.com/yeoman/generator-chrome-extension)

## Test
To test, go to: chrome://extensions, enable Developer mode and load app as an unpacked extension.

## License
[MIT License](http://en.wikipedia.org/wiki/MIT_License)

