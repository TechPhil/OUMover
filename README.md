# OUMover

A tool to automatically move ChromeOS devices from one OU to another, according to a configuration file. Can also make multiple moves at the same time.
Good for moving Chromebooks in/out of management, for example, in a school environment

---

## Prerequisites

You must create and generate a Google Cloud Project `credentials.json` file.
To do this, you must be logged in as a Super Administrator for your domain

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project - You may need to provide billing information. Normal usage should not exceed free quotas.
3. Find the Admin SDK in the 'APIs and Services' page, and enable it.
4. Go to the OAuth Consent Screen page to configure.
   1. Choose an internal app. This means Google will not need to verify your project
   2. Fill in the required fields on the first page -
      1. App Name
      2. User support email
      3. Developer contact information
   3. On the Scopes page, add the following scopes -
      1. `/auth/admin.directory.device.chromeos` - View and manage your Chrome OS devices' metadata
      2. `/auth/admin.directory.orgunit` - View and manage organisation units on your domain
5. Go to the Credentials screen and create a new OAuth Client ID
   1. Choose a Desktop App, and give it a name
   2. Download the JSON file when prompted
   3. Save this file in the same directory as OUMover, and call the file `credentials.json`

---

## Configuration

Edit `config.json` to contain the configuration you desire. Multiple configurations can be entered, and selected at runtime.

```json
{
    "configOne": [
        ["/oldOU1","/new/newOU1"],
        ["/oldOU2","/new/newOU2"]
    ],
    "configTwo": [
        ["/new/newOU1","/oldOU1"],
        ["/new/newOU2","/oldOU2"]
    ]
}
```

With this config, the program will ask you to enter either `configOne` or `configTwo` at runtime, and then confirm the moves expected

**ℹ️ Enter the full OU paths, excluding your Domain. Enter a leading slash, but _not_ a trailing one.**
