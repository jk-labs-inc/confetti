import LandingPage from "@components/_pages/Landing/components";
import { loadFeaturedSnapshot } from "lib/contests/featured/load";

export const revalidate = 60;

const Page = async () => <LandingPage snapshot={await loadFeaturedSnapshot()} />;

export default Page;
