import { Metadata } from "next";
import HowItWorks from "./how-it-works";

export const metadata: Metadata = {
  title: "How It Works - Confetti",
};

const Page = () => {
  return <HowItWorks />;
};

export default Page;
