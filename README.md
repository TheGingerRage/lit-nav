# Lightning Navigator

This extension helps you get to any Salesforce page quickly. Just type in what you need to do!

## Commands

#### Refresh Metadata
Syntax: `Refresh Metadata` **(Classic Only)**

Forces the extension to retrieve metadata from the Salesforce org. Use this if you see that commands aren't populating in the extension.

------------

#### Setup 
Syntax: `Setup`
As a standalone command, this acts as a navigational shortcut to Setup.

------------

#### General Navigation
Syntax: `Setup <Category> <Subcategory/Key> <Destination>`

Any of the four components to this command are optional, and do not require entire words. Think of this as executing a large search against an index of locations. The more specific you are with your search words, the more accurate the results will be.

***This is not limited to custom objects.  The following are also searcable: Apex Classes, Apex Triggers, VisualForce Pages, VisualForce Components, Profiles, Users, Custom Settings, Flows, and Custom Labels.***

***Custom Settings are searchable by Category and/or Key.
Custom Labels are searchable by Category and Name, and by Category and Value.
All others listed are searchable by Name only at this time.***

Here are two examples:

- **setup Profile System Administrator**

This will navigate to the profile of the System Administrator.  In this case, it would be faster to just enter `System Administrator` and find `Setup > Profile > System Administrator` on the list of matching commands.

------------

- **sys prop doc man upload**

This will navigate to the nFORCE System Property that controls the upload limit for docman. 
The fully qualified command will look like this: `Setup > System Property (nFORCE) > document manager > upload mb limit`

------------

#### Lists
Syntax: `List <Object/Custom Object>`

- **List AccountDocuments**

Takes the user to a list view for any object type, even those without tabs. This command is also compatible with things like Apex Classes, Visualforce Components, Jobs, Logs, pretty much anything you can get to from setup. Play around with it!

------------

#### New
Syntax: `New <Object/Custom Object>`

- **New Collateral**

Takes the user to the create page for any object type, again, even those without tabs. Much like list, this works with just about anything. If used from Lightning, it may take the user back to Classic on the way to the creation page.

------------

#### Organization Limits 
Syntax: `OrgLimits` **(Classic Only)**

This shows at a glance statistics of your organizational limits along with remaining values.
[![org](https://i.imgur.com/kkeKa2p.png "org")](https://i.imgur.com/kkeKa2p.png "org")

------------

#### Create Field
Usage: `cf` **(Classic Only)**

The cf (create field) command can be used in conjunction with an object API name like `Account`, a name for a new field, a type like `TEXT`, along with any necessary parameters depending on type, to create a new field on that object.

Usage: `cf <Object API Name> <Field Name> <Data Type>`

Data Type Syntax and Examples:

------------

- `AUTONUMBER`

**cf Account TestAutonumber AUTONUMBER**

------------

- `CHECKBOX`

**cf Account TestCheckbox CHECKBOX**

------------

- `CURRENCY <Scale> <Precision>`

**cf Account TestCurrency CURRENCY 8 2**

------------

- `DATE`

**cf Account TestDate DATE**

------------

- `DATETIME`

**cf Account TestDateTime DATETIME**

------------

- `EMAIL`

**cf Account TestEmail EMAIL**

------------

- `GEOLOCATION <Scale>`

**cf Account TestGPS GEOLOCATION 5**

------------

- `LOOKUP <sObject API Name>`

**cf Account TestLookupLoan LOOKUP Opportunity**

(When using custom objects, full API names must be used)

------------

- `NUMBER <Scale> <Precision>`

**cf Account TestNumber NUMBER 8 2**

------------

- `PERCENT <Scale> <Precision>`

**cf Account TestPercent PERCENT 3 2**

------------

- `PHONE`

**cf Account TestPhone PHONE**

------------

- `PICKLIST`

**cf Account TestPicklist PICKLIST**

(The picklist will have a filler value and will need to be changed)

------------

- `PICKLISTMS`

**cf Account TestMultiSelectPicklist PICKLISTMS**

(The picklist will have a filler value and will need to be changed)

------------

- `TEXT <Length>`

**cf Account TestText TEXT 40**

------------

- `TEXTAREA`

**cf Account TestTextArea TEXTAREA**

------------

- `TEXTAREALONG <Length> <Visible Lines>`

**cf Account TestTextAreaLong TEXTAREALONG 256 5**

(Minimum length of 256)

------------

- `TEXTAREARICH <Length> <Visible Lines>`

**cf Account TestTextAreaRich TEXTAREARICH 256 10**

(Minimum length of 256, minimum visible lines of 10)

------------

- `URL`

**cf Account TestURL URL**

------------

## Patch Notes

### 0.2.3

- Fixed the link generation for `cf`.

### 0.2.2

- Added a 'feature' to the `List` command that will suffix the object with the package namespace. eg: `List Products (LLC_BI)` This will prevent custom object names with the same name (cross-package or Salesforce) from de-duping into a single incorrect navigation point.
- Added an error message when attempting to us the `cf` command from VisualForce/Lightning.
- Added a link to the success result from `cf` to allow the user to navigate directly to the newly created field.
- Updated the error messages recieved when hitting VisualForce/Lightning stoppage.

### 0.2.1

- Fixed bug where the modal would vanish when clicking the `OrgLimits` command, making the results impossible to read.
- `OrgLimits` properly clears out the search bar after executing the command.
- `OrgLimits` will throw an error in Lightning and VisualForce, rather than churn and do nothing.
- Fixed bug with precision not being passed properly by forceTooling when attempting to create certain field types.
- Fixed bug where creating a new `TEXTAREALONG` or `TEXTAREARICH` would use the character count for the number of visible lines.
- Corrected help text typo on `TEXTAREA` creation.
- Added details for commands to this lovely Readme.

### 0.2.0
- Added navigation to Custom Labels by Category > Name OR by Category > Value. This is a lot of data to load so please be patient on orgs that approach that 10,000 label mark. It takes a second to append all the information.
- Minor code formatting fixes and domain addressing cleanup.

### 0.1.1
 - Type in `OrgLimits` and press enter to see the current Org Limits displayed below in a scrollable list. Delete `OrgLimits` to return to using Lightning Navigator normally.
 - Added navigation to the following by name: Apex Classes, Apex Triggers, Apex Pages, Users, Profiles, VisualForce Pages, VisualForce Components, Flows
 - Added navigation to nForce and LLC_BI System Properties by Category and Key (eg: Setup > System Property (nFORCE) > document manager > archive_browser_visible)

 - Refresh Metadata won't glitch out on VF pages causing the extension to fill up with "undefined"
 - Refresh Metadata also elgeantly fails in Lightning now, rather than showing a loading indicator for a minute then doing nothing.
 - Cleaned up some DOM interaction with appendChild/removeChild calls being mishandled

------------

## For Devs

### Getting Started
Project was scaffolded using [Yeoman](http://yeoman.io/) using [generator-chrome-extension](https://github.com/yeoman/generator-chrome-extension)

### Test
To test, go to: chrome://extensions, enable Developer mode and load app as an unpacked extension.

### License
[MIT License](http://en.wikipedia.org/wiki/MIT_License)

