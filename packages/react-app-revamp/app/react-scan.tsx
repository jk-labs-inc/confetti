"use client";

import { useEffect } from "react";

export default function ReactScan() {
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      import("react-scan").then(({ scan }) => {
        scan({ enabled: true, showToolbar: true });
      });
    }
  }, []);

  return null;
}
