# Lightning Navigator

This extension helps you get to any salesforce page quickly. Just type in what you need to do.

- All objects list views and create new pages are available (even for objects that don't have tabs). Type in "List <Object Name>" or "New <Object Name>"

- All setup links are available -- Type in "Setup" to see all. For example, if you want to get to the Account fields setup, type in "Account Fields". Or any custom object setup page, type "setup <Custom Object Name>"

- (beta) Thanks to the SF tooling API, you can now create fields. "cf Account newField TEXT 100."

- The original Salesforce Navigator was seemingly abandoned. All I did was add the little bit needed to support Lightning. I renamed it to prevent confusion on the Chrome Store, and in case I decide to maintain the project moving forward.

- After running Refresh Metadata, you have to execute Setup from the nav bar as well, this will take you to the classic setup and completes the caching of data. From that point you can navigate from Lightning.

## Getting Started
Project was scaffolded using [Yeoman](http://yeoman.io/) using [generator-chrome-extension](https://github.com/yeoman/generator-chrome-extension)

## Test
To test, go to: chrome://extensions, enable Developer mode and load app as an unpacked extension.

## License
[MIT License](http://en.wikipedia.org/wiki/MIT_License)

