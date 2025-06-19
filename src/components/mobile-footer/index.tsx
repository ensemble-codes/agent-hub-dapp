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
        <Link href={"/service-center"} className="flex flex-col items-center">
          <img
            src={
              pathname === "/service-center"
                ? "/assets/active-service-highlighted-icon.svg"
                : "/assets/active-service-icon.svg"
            }
            alt="active-service"
            className="w-6 h-6"
          />
        </Link>
        <Link href={"/task-center"} className="flex flex-col items-center">
          <img
            src={
              pathname === "/task-center"
                ? "/assets/task-center-highlighted-icon.svg"
                : "/assets/task-center-icon.svg"
            }
            alt="task-center"
            className="w-6 h-6"
          />
        </Link>
      </div>
    </div>
  );
};

export default MobileFooter;
