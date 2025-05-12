"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";

const SideMenu = () => {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="sticky top-[124px] flex-shrink-0">
      <div className="p-4 bg-white rounded-[16px] w-full flex flex-col items-start justify-between">
        <div
          className={`p-4 rounded-[16px] ${
            pathname === "/orchestrator" ? "bg-[#F5F5F5]" : ""
          }`}
        >
          <Link href={"/orchestrator"}>
            <img
              src={
                pathname === "/orchestrator"
                  ? "/assets/ensemble-highlighted-icon.svg"
                  : "/assets/ensemble-icon.svg"
              }
              alt="orchestrator"
              className="w-6 h-6"
            />
          </Link>
        </div>
        <div
          className={`p-4 rounded-[16px] ${
            pathname === "/task-center" ? "bg-[#F5F5F5]" : ""
          }`}
        >
          <Link href={"/task-center"}>
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
        <div
          className={`p-4 rounded-[16px] ${
            pathname === "/" ? "bg-[#F5F5F5]" : ""
          }`}
        >
          <Link href={"/"}>
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
        </div>
        <div
          className={`p-4 rounded-[16px] ${
            pathname === "/service-center" ? "bg-[#F5F5F5]" : ""
          }`}
        >
          <Link href={"/service-center"}>
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
        </div>
        {isConnected ? (
          <div className={`p-4 rounded-[16px] mt-[48px]`}>
            <img
              src={"/assets/disconnect-icon.svg"}
              alt="disconnect"
              className="w-6 h-6"
              onClick={() => disconnect()}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SideMenu;
