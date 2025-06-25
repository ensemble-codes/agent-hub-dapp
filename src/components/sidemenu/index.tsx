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
          <p className="text-[20px] font-semibold text-[#000000] leading-[auto]">
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
              Market Place
            </p>
          </Link>
          {pathname === `/` ? <div className="w-[8px] h-10 rounded-l-[8px] bg-primary absolute right-0 top-[16px]" /> : null}
        </div>
        <div
          className={`px-4 py-6 border-b-[0.5px] border-b-[#8F95B2] relative`}
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
              Register Agent
            </p>
          </Link>
          {pathname === `/register-agent` ? <div className="w-[8px] h-10 rounded-l-[8px] bg-primary absolute right-0 top-[16px]" /> : null}
        </div>
        <div
          className={`px-4 py-6 border-b-[0.5px] border-b-[#8F95B2] relative`}
        >
          <Link href={"/service-center"} className="flex items-center gap-2">
            <img
              src={
                pathname === "/service-center"
                  ? "/assets/active-service-highlighted-icon.svg"
                  : "/assets/active-service-icon.svg"
              }
              alt="active-service"
              className="w-6 h-6"
            />
            <p
              className={`${
                pathname === "/service-center" ? "text-primary" : "text-[#8F95B2]"
              } font-semibold`}
            >
              Service Center
            </p>
          </Link>
          {pathname === `/service-center` ? <div className="w-[8px] h-10 rounded-l-[8px] bg-primary absolute right-0 top-[16px]" /> : null}
        </div>
        <div
          className={`px-4 py-6 pb-40 relative`}
        >
          <Link href={"/task-center"} className="flex items-center gap-2">
            <img
              src={
                pathname === "/task-center"
                  ? "/assets/task-center-highlighted-icon.svg"
                  : "/assets/task-center-icon.svg"
              }
              alt="task-center"
              className="w-6 h-6"
            />
            <p
              className={`${
                pathname === "/task-center" ? "text-primary" : "text-[#8F95B2]"
              } font-semibold`}
            >
              Task Center
            </p>
          </Link>
          {pathname === `/task-center` ? <div className="w-[8px] h-10 rounded-l-[8px] bg-primary absolute right-0 top-[16px]" /> : null}
        </div>
        <img src="/assets/sidemenu-footer-pattern-icon.svg" alt="pattern" className="w-full h-[auto]" />
      </div>
    </div>
  );
};

export default SideMenu;
