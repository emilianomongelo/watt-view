#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

APP_NAME="GrowattPlusMenuBar"
APP_DIR="WattView.app"

echo "==> Building ${APP_NAME} with Swift…"
swift build -c release 2>&1

echo "==> Creating .app bundle…"
rm -rf "${APP_DIR}"
mkdir -p "${APP_DIR}/Contents/MacOS"
mkdir -p "${APP_DIR}/Contents/Resources"

cp ".build/release/${APP_NAME}" "${APP_DIR}/Contents/MacOS/"
cp "Sources/GrowattPlusMenuBar/App/Info.plist" "${APP_DIR}/Contents/"
cp "Sources/GrowattPlusMenuBar/App/AppIcon.icns" "${APP_DIR}/Contents/Resources/" 2>/dev/null || true
echo -n 'APPL????' > "${APP_DIR}/Contents/PkgInfo"

# Ad-hoc sign so macOS trusts it
codesign --force --sign - "${APP_DIR}" 2>/dev/null || true

echo ""
echo "==> Done! Built: ${APP_DIR}"
echo "    Run:   open '${APP_DIR}'"
echo "    Or:    ./'${APP_DIR}'/Contents/MacOS/${APP_NAME}"
