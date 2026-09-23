#!/usr/bin/env bash
# Regenerates the subset web fonts in src/assets/fonts/ from the full files in
# src/assets/fonts/source/. Requires pyftsubset (fonttools): `brew install fonttools`.
#
# Ranges follow Google Fonts' "latin" and "latin-ext" subsets. Keep them in sync with
# the `unicodeRange` values in astro.config.ts.
set -euo pipefail
cd "$(dirname "$0")/../src/assets/fonts"

LATIN="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
LATIN_EXT="U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF"
# Code also shows arrows, box drawing (CLI output) and check/cross marks.
CODE_SYMBOLS="U+2190-21FF,U+2500-257F,U+2713-2717"

subset() {
	pyftsubset "source/$1.woff2" --unicodes="$2" --layout-features='*' --flavor=woff2 --output-file="$3"
	printf '%-36s %4d KB\n' "$3" $(( $(wc -c < "$3") / 1024 ))
}

subset Inter-Variable "$LATIN" Inter-Variable-latin.woff2
subset Inter-Variable "$LATIN_EXT" Inter-Variable-latin-ext.woff2
subset Inter-Variable-Italic "$LATIN" Inter-Variable-Italic-latin.woff2
subset Inter-Variable-Italic "$LATIN_EXT" Inter-Variable-Italic-latin-ext.woff2
subset JetBrainsMono-Variable "$LATIN,$LATIN_EXT,$CODE_SYMBOLS" JetBrainsMono-Variable-code.woff2
