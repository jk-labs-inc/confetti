import Link from "next/link";

export const metadata = {
  title: "Page not found - Confetti",
  description: "Confetti - vote. rally. earn.",
};

const NotFoundPage = () => {
  return (
    <div className="container m-auto sm:text-center animate-appear">
      <h1 className="text-[40px] font-black mb-3 text-neutral-11 font-sabo-filled">Page not found</h1>
      <p className="text-neutral-11 mb-6 text-[16px]">
        sorry! the page you are looking for was deleted or it doesn't exist.
      </p>
      <Link href="/">Go back to home page</Link>
    </div>
  );
};

export default NotFoundPage;
