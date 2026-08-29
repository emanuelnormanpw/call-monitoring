#!/usr/bin/env bash
# Install the toolchain needed to run this project locally: Rust, Node.js and
# Yarn. Docker is detected but never installed for you - see the note below.
#
#   ./install-toolchain.sh            install whatever is missing or too old
#   ./install-toolchain.sh --check    report what is missing, install nothing
#   ./install-toolchain.sh --help
#
# Safe to re-run: anything already new enough is left alone.
# Exits non-zero when something is still missing, so it can gate other steps.

set -u

MIN_RUST="1.88"
MIN_NODE="20"
YARN_VERSION="1.22.22"
NVM_VERSION="v0.40.1"

CHECK_ONLY=0

for arg in "$@"; do
  case "$arg" in
    --check) CHECK_ONLY=1 ;;
    -h|--help) sed -n '2,/^$/p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown argument: $arg (try --help)" >&2; exit 2 ;;
  esac
done

if [ -t 1 ]; then
  C_OK=$'\033[32m'; C_WARN=$'\033[33m'; C_ERR=$'\033[31m'; C_OFF=$'\033[0m'
else
  C_OK=''; C_WARN=''; C_ERR=''; C_OFF=''
fi

say()  { echo "${C_OK}[setup]${C_OFF} $*"; }
warn() { echo "${C_WARN}[setup]${C_OFF} $*"; }
fail() { echo "${C_ERR}[setup]${C_OFF} $*" >&2; exit 1; }

have() { command -v "$1" >/dev/null 2>&1; }

# True when $1 >= $2, comparing dotted version numbers.
version_ge() {
  [ "$(printf '%s\n%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]
}

OS="$(uname -s)"
case "$OS" in
  Darwin|Linux) ;;
  *) fail "Unsupported platform: $OS. Install Rust, Node 20+, Yarn 1.x and Docker manually." ;;
esac

RESTART_SHELL=0

# ---------- Rust ----------
setup_rust() {
  if have rustc && version_ge "$(rustc --version | awk '{print $2}')" "$MIN_RUST"; then
    say "Rust $(rustc --version | awk '{print $2}') is already new enough."
    return
  fi

  if have rustc; then
    warn "Rust $(rustc --version | awk '{print $2}') is older than $MIN_RUST (Cargo.lock needs edition2024)."
  else
    warn "Rust is not installed."
  fi
  [ "$CHECK_ONLY" -eq 1 ] && return

  if have rustup; then
    say "Updating the stable toolchain with rustup..."
    rustup update stable || fail "rustup update failed."
  else
    say "Installing Rust with rustup..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
      || fail "rustup install failed."
    RESTART_SHELL=1
  fi

  # Make cargo visible to the rest of this script.
  [ -f "$HOME/.cargo/env" ] && . "$HOME/.cargo/env"
}

# ---------- Node.js ----------
setup_node() {
  if have node && version_ge "$(node --version | tr -d 'v')" "$MIN_NODE"; then
    say "Node $(node --version) is already new enough."
    return
  fi

  if have node; then
    warn "Node $(node --version) is older than v$MIN_NODE."
  else
    warn "Node.js is not installed."
  fi
  [ "$CHECK_ONLY" -eq 1 ] && return

  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

  if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    say "Installing nvm..."
    curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh" | bash \
      || fail "nvm install failed."
    RESTART_SHELL=1
  fi

  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh" || fail "Could not load nvm from $NVM_DIR."

  say "Installing Node $MIN_NODE with nvm..."
  nvm install "$MIN_NODE" || fail "nvm install $MIN_NODE failed."
  nvm alias default "$MIN_NODE" >/dev/null 2>&1
  RESTART_SHELL=1
}

# ---------- Yarn ----------
setup_yarn() {
  if have yarn && [ "$(yarn --version | cut -d. -f1)" = "1" ]; then
    say "Yarn $(yarn --version) is already installed."
    return
  fi

  if have yarn; then
    warn "Yarn $(yarn --version) is not v1; this repo uses a v1 lockfile."
  else
    warn "Yarn is not installed."
  fi
  [ "$CHECK_ONLY" -eq 1 ] && return

  have npm || fail "npm is unavailable, so Yarn cannot be installed. Re-run after Node is set up."

  say "Installing Yarn $YARN_VERSION..."
  npm install -g "yarn@$YARN_VERSION" || fail "npm install -g yarn failed."
}

# ---------- Docker ----------
# Deliberately not automated: it needs administrator rights, and on macOS it is
# a GUI application whose licence must be accepted interactively.
setup_docker() {
  if have docker && docker info >/dev/null 2>&1; then
    say "Docker is installed and the daemon is running."
    return
  fi

  if have docker; then
    warn "Docker is installed but the daemon is not running. Start Docker Desktop, then re-run."
    return
  fi

  warn "Docker is not installed. Install it yourself, then re-run:"
  if [ "$OS" = "Darwin" ]; then
    echo "         brew install --cask docker      # or download Docker Desktop"
  else
    echo "         curl -fsSL https://get.docker.com | sudo sh"
  fi
}

if [ "$CHECK_ONLY" -eq 1 ]; then
  say "Checking the toolchain (nothing will be installed)."
else
  say "Setting up the toolchain for $OS."
fi
echo

setup_rust
setup_node
setup_yarn
setup_docker

# ---------- summary ----------
echo
say "Summary"

MISSING=0

report() {
  printf "  %-8s %s%s%s\n" "$1" "$C_OK" "$2" "$C_OFF"
}

report_missing() {
  printf "  %-8s %s%s%s\n" "$1" "$C_ERR" "$2" "$C_OFF"
  MISSING=$((MISSING + 1))
}

if have rustc && version_ge "$(rustc --version | awk '{print $2}')" "$MIN_RUST"; then
  report Rust "$(rustc --version | awk '{print $2}')"
else
  report_missing Rust "missing or older than $MIN_RUST"
fi

if have node && version_ge "$(node --version | tr -d 'v')" "$MIN_NODE"; then
  report Node "$(node --version)"
else
  report_missing Node "missing or older than v$MIN_NODE"
fi

if have yarn && [ "$(yarn --version | cut -d. -f1)" = "1" ]; then
  report Yarn "$(yarn --version)"
else
  report_missing Yarn "missing or not v1"
fi

if have docker && docker info >/dev/null 2>&1; then
  report Docker "running"
elif have docker; then
  report_missing Docker "installed, daemon not running"
else
  report_missing Docker "not installed (install it manually)"
fi

if [ "$RESTART_SHELL" -eq 1 ]; then
  echo
  warn "Open a new terminal (or source your shell profile) so the new tools land on PATH."
fi

echo
if [ "$MISSING" -eq 0 ]; then
  say "Toolchain ready. Next: docker compose up -d postgres && cp frontend/.env.example frontend/.env"
  exit 0
fi

if [ "$CHECK_ONLY" -eq 1 ]; then
  warn "$MISSING item(s) still needed. Re-run without --check to install them."
else
  warn "$MISSING item(s) still needed - see the notes above."
fi
exit 1
