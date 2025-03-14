import { Link } from "react-router";
import BaloonOutlineSvg from "../svg/balloon-outline";
import { Button } from "../ui/button";

export function Navbar() {
  return (
    <nav className="px-2 xs:px-0 mx-auto w-full max-w-screen-mmax flex justify-between items-center py-6">
      <Link to="#" className="flex items-center gap-2">
        <span className="flex h-6 items-center justify-center rounded-md text-primary-foreground">
          <BaloonOutlineSvg />
        </span>
      </Link>
      <div className="flex gap-4 items-center">
        {/* <Link to="#pricing">Pricing</Link> */}
        <Link to="#features">Features</Link>
        <Link to="#faq">FAQ</Link>
        <Button
          className="hidden sm:block"
          onClick={() => (window.location.href = "/join-waitlist")}
        >
          Get Started for free
        </Button>
      </div>
    </nav>
  );
}
