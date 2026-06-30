#!/bin/bash
# =============================================================================
# EAS Build Pre-Install Hook
# =============================================================================
# NativeWind's Tailwind child process tries to access the clipboard via
# xclip/xsel on headless EAS servers, causing an infinite retry loop that
# prevents the Gradle phase from completing within the time limit.
#
# Fix: Create no-op stubs in a user-writable directory and prepend to PATH.
# =============================================================================

# The EAS build environment includes /home/expo/workingdir/bin in the PATH by default.
# The pre-install script runs in /home/expo/workingdir/build.
STUB_DIR="$(dirname "$PWD")/bin"
mkdir -p "$STUB_DIR"

# Create stub xclip
echo '#!/bin/sh' > "$STUB_DIR/xclip"
echo 'timeout 1 cat > /dev/null 2>&1' >> "$STUB_DIR/xclip"
echo 'exit 0' >> "$STUB_DIR/xclip"
chmod +x "$STUB_DIR/xclip"

# Create stub xsel
echo '#!/bin/sh' > "$STUB_DIR/xsel"
echo 'timeout 1 cat > /dev/null 2>&1' >> "$STUB_DIR/xsel"
echo 'exit 0' >> "$STUB_DIR/xsel"
chmod +x "$STUB_DIR/xsel"

# Prepend to PATH for all subsequent build phases
export PATH="$STUB_DIR:$PATH"

# Persist PATH for Gradle and other child processes
echo "export PATH=\"$STUB_DIR:\$PATH\"" >> "$HOME/.bashrc"
echo "export PATH=\"$STUB_DIR:\$PATH\"" >> "$HOME/.profile"

echo "[eas-build-pre-install] Clipboard stubs installed at $STUB_DIR"
echo "[eas-build-pre-install] xclip -> $(which xclip)"
echo "[eas-build-pre-install] xsel  -> $(which xsel)"
