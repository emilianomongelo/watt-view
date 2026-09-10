#!/bin/bash
set -euo pipefail

# Install Watt View macOS widget
# Run this script on the target Mac after copying GrowattPlusMenuBar.zip

APP_NAME="GrowattPlusMenuBar"
APP_DIR="${APP_NAME}.app"
ZIP_NAME="${APP_NAME}.zip"

echo "==> Watt View Installer"
echo ""

# Check if zip exists
if [ ! -f "${ZIP_NAME}" ]; then
    echo "Error: ${ZIP_NAME} not found in current directory."
    echo "Make sure you're running this script from the directory containing the zip."
    exit 1
fi

# Check if already installed
if [ -d "/Applications/${APP_DIR}" ]; then
    echo "${APP_NAME} is already installed in /Applications."
    read -p "Overwrite? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
    # Kill running instance
    pkill -f "${APP_NAME}" 2>/dev/null || true
    sleep 1
fi

# Extract
echo "==> Extracting ${ZIP_NAME}..."
unzip -o "${ZIP_NAME}"

# Remove quarantine attribute (required for unsigned/ad-hoc signed apps)
echo "==> Removing quarantine attribute..."
xattr -cr "${APP_DIR}"

# Move to Applications
echo "==> Installing to /Applications..."
mv "${APP_DIR}" "/Applications/"

echo ""
echo "==> Installed! ${APP_NAME} is in /Applications."
echo ""
echo "To run:"
echo "  open /Applications/${APP_DIR}"
echo ""
echo "To add to login items (auto-start on boot):"
echo "  System Settings → General → Login Items → Add ${APP_NAME}"
echo ""
echo "To configure the API:"
echo "  Click the sun icon in the menu bar → gear icon → set API URL and Token"
