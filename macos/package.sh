#!/bin/bash
set -euo pipefail

# Package Watt View macOS widget for distribution
# Creates a signed .app bundle inside a .zip ready to transfer to another Mac

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

APP_NAME="GrowattPlusMenuBar"
APP_DIR="${APP_NAME}.app"
ZIP_NAME="${APP_NAME}.zip"
VERSION="0.1.0"

echo "==> Building ${APP_NAME} v${VERSION} (release)..."
swift build -c release 2>&1

echo "==> Creating .app bundle..."
rm -rf "${APP_DIR}"
mkdir -p "${APP_DIR}/Contents/MacOS"
mkdir -p "${APP_DIR}/Contents/Resources"

cp ".build/release/${APP_NAME}" "${APP_DIR}/Contents/MacOS/"
cp "Sources/GrowattPlusMenuBar/App/Info.plist" "${APP_DIR}/Contents/"
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
echo "    2. Unzip: unzip ${ZIP_NAME}"
echo "    3. Remove quarantine: xattr -cr ${APP_DIR}"
echo "    4. Move to Applications: mv ${APP_DIR} /Applications/"
echo "    5. Open: open /Applications/${APP_DIR}"
echo ""
echo "    Or run the install script: ./install.sh"
