#!/bin/bash
set -euo pipefail

# Package Watt View macOS widget for distribution
# Creates a signed .app bundle inside a .zip ready to transfer to another Mac

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

BIN_NAME="GrowattPlusMenuBar"
APP_DIR="WattView.app"
ZIP_NAME="WattView.zip"
VERSION="0.1.0"

echo "==> Building Watt View v${VERSION} (release)..."
swift build -c release 2>&1

echo "==> Creating .app bundle..."
rm -rf "${APP_DIR}"
mkdir -p "${APP_DIR}/Contents/MacOS"
mkdir -p "${APP_DIR}/Contents/Resources"

cp ".build/release/${BIN_NAME}" "${APP_DIR}/Contents/MacOS/"
cp "Sources/GrowattPlusMenuBar/App/Info.plist" "${APP_DIR}/Contents/"
cp "Sources/GrowattPlusMenuBar/App/AppIcon.icns" "${APP_DIR}/Contents/Resources/" 2>/dev/null || true
echo -n 'APPL????' > "${APP_DIR}/Contents/PkgInfo"

# Ad-hoc sign
echo "==> Signing..."
codesign --force --sign - "${APP_DIR}" 2>/dev/null || true

# Create zip for distribution
echo "==> Packaging ${ZIP_NAME}..."
rm -f "${ZIP_NAME}"
ditto -c -k --sequesterRsrc --keepParent "${APP_DIR}" "${ZIP_NAME}"

ZIP_SIZE=$(du -h "${ZIP_NAME}" | cut -f1)
echo ""
echo "==> Done!"
echo "    App:   ${APP_DIR}"
echo "    Zip:   ${ZIP_NAME} (${ZIP_SIZE})"
echo ""
echo "    To install on another Mac:"
echo "    1. Copy ${ZIP_NAME} to the target Mac"
echo "    2. unzip ${ZIP_NAME}"
echo "    3. xattr -cr ${APP_DIR}"
echo "    4. mv ${APP_DIR} /Applications/"
echo "    5. open /Applications/${APP_DIR}"
