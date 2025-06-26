"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SideMenu = () => {
  const pathname = usePathname();

  return (
    <div className="hidden lg:block sticky top-[60px] flex-shrink-0">
      <div className="bg-white rounded-[16px] w-full">
        <Link href={"/"} className="flex items-center gap-2 p-4 mb-8">
          <img
            src="/assets/logo-icon.svg"
            alt="logo-icon"
            className="w-[40px] h-[36px]"
          />
          <p className="text-[20px] font-[Montserrat] font-semibold text-[#000000] leading-[auto]">
            <span className="text-primary">AGENT</span>&nbsp;HUB
          </p>
        </Link>
        <div className={`px-4 pb-6 border-b-[0.5px] border-b-[#8F95B2] relative`}>
          <Link href={"/chat"} className="flex items-center gap-2">
            <img
              src={
                pathname === "/chat"
                  ? "/assets/ensemble-highlighted-icon.svg"
                  : "/assets/ensemble-icon.svg"
              }
              alt="chat"
              className="w-6 h-6"
            />
            <p
              className={`${
                pathname === "/chat" ? "text-primary" : "text-[#8F95B2]"
              } font-semibold`}
            >
              Orchestrator
            </p>
          </Link>
          {pathname === `/chat` ? <div className="w-[8px] h-10 rounded-l-[8px] bg-primary absolute right-0 top-[-10px]" /> : null}
        </div>
        <div
          className={`px-4 py-6 border-b-[0.5px] border-b-[#8F95B2] relative`}
        >
          <Link href={"/"} className="flex items-center gap-2">
            <img
              src={
                pathname === "/"
                  ? "/assets/globe-marketplace-highlighted-icon.svg"
                  : "/assets/globe-marketplace-icon.svg"
              }
              alt="marketplace"
              className="w-6 h-6"
            />
            <p
              className={`${
                pathname === "/" ? "text-primary" : "text-[#8F95B2]"
              } font-semibold`}
            >
              Marketplace
            </p>
          </Link>
          {pathname === `/` ? <div className="w-[8px] h-10 rounded-l-[8px] bg-primary absolute right-0 top-[16px]" /> : null}
        </div>
        <div
          className={`px-4 pt-6 pb-72 relative`}
        >
          <Link href={"/register-agent"} className="flex items-center gap-2">
            <img
              src={
                pathname === "/register-agent"
                  ? "/assets/register-agent-highlighted-icon.svg"
                  : "/assets/register-agent-dull-icon.svg"
              }
              alt="marketplace"
              className="w-6 h-6"
            />
            <p
              className={`${
                pathname === "/register-agent" ? "text-primary" : "text-[#8F95B2]"
              } font-semibold`}
            >
              Agent Wizard
            </p>
          </Link>
          {pathname === `/register-agent` ? <div className="w-[8px] h-10 rounded-l-[8px] bg-primary absolute right-0 top-[16px]" /> : null}
        </div>
        <img src="/assets/sidemenu-footer-pattern-icon.svg" alt="pattern" className="w-full h-[auto]" />
      </div>
    </div>
  );
};

export default SideMenu;
