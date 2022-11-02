# OUMover

A tool to automatically move ChromeOS devices from one OU to another, according to a configuration file. Can also make multiple moves at the same time.

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
