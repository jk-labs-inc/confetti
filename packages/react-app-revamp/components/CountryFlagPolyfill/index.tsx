"use client";

import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";
import { useEffect } from "react";

// registers the "Twemoji Country Flags" @font-face referenced by the font stacks in app/globals.css;
// the font is only downloaded on browsers without native flag emoji (Windows)
const CountryFlagPolyfill = () => {
  useEffect(() => {
    polyfillCountryFlagEmojis();
  }, []);

  return null;
};

export default CountryFlagPolyfill;
