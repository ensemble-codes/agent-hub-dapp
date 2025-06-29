"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MobileFooter = () => {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed z-[20] bottom-0 left-0 right-0 bg-white border-t-[0.5px] border-t-[#8F95B2] p-4">
      <div className="flex items-center justify-around">
        <Link href={"/chat"} className="flex flex-col items-center">
          <img
            src={
              pathname === "/chat"
                ? "/assets/ensemble-highlighted-icon.svg"
                : "/assets/ensemble-icon.svg"
            }
            alt="chat"
            className="w-6 h-6"
          />
        </Link>
        <Link href={"/"} className="flex flex-col items-center">
          <img
            src={
              pathname === "/"
                ? "/assets/globe-marketplace-highlighted-icon.svg"
                : "/assets/globe-marketplace-icon.svg"
            }
            alt="marketplace"
            className="w-6 h-6"
          />
        </Link>
        <Link href={"/register-agent"} className="flex flex-col items-center">
          <img
            src={
              pathname === "/register-agent"
                ? "/assets/register-agent-highlighted-icon.svg"
                : "/assets/register-agent-dull-icon.svg"
            }
            alt="marketplace"
            className="w-6 h-6"
          />
        </Link>
      </div>
    </div>
  );
};

export default MobileFooter;
