# MedPup Scripts

Utility scripts for MedPup operations.

| Script | Purpose | When to Run |
|--------|---------|-------------|
| `build-website.sh` | Build or preview the Hugo website | `./build-website.sh` to build, `./build-website.sh --serve` to preview |
| `go-bag-check.sh` | Verify Go-Bag is fully stocked | Before every trip |
| `regulatory-monitor.sh` | Check USDA, CDC, Click2Clear, Balearia for changes | Weekly (cron) |
| `new-trip-log.sh` | Create a new trip log file for post-trip debrief | After each trip |

All scripts run from any directory — paths are relative to the script location.
