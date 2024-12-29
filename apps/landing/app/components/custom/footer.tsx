import { Link } from "react-router";
import { cn } from "../../lib/utils";
import BaloonOutlineSvg from "../svg/balloon-outline";
import { InstagramIcon, XIcon } from "../svg/brand-icons";

export function Footer() {
  return (
    <footer
      className={cn(
        "w-full max-w-screen-mmax mx-auto",
        "grow flex items-center justify-between gap-6 py-6",
        "border-t border-[#0000000F]"
      )}
    >
      <div className='flex items-center gap-2'>
        <span
          className={cn(
            "flex h-6  items-center justify-center rounded-md",
            "w-6 text-primary-foreground"
          )}
        >
          <BaloonOutlineSvg className='size-[26px]' />
        </span>
        <span className='text-2xl font-bold'>Mellow</span>
        <span className='opacity-30 text-base ml-2 pt-1'>
          Built with love from Bangalore
        </span>
      </div>
      <div className='flex items-center gap-4'>
        <Link to='https://x.com/mellow_app'>
          <XIcon />
        </Link>
        <Link to='https://instagram.com/mellow_app'>
          <InstagramIcon />
        </Link>
      </div>
    </footer>
  );
}
