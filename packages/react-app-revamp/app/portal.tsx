"use client";
import TransactionOverlay from "@components/UI/TransactionOverlay";
import { Slide, ToastContainer } from "react-toastify";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";

const Portal = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <>
      <ToastContainer
        position="bottom-center"
        autoClose={4000}
        hideProgressBar
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Slide}
      />
      <TransactionOverlay />
    </>,
    document.body,
  );
};

export default Portal;
