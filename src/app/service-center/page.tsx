"use client";
import { useRouter } from "next/navigation";
import { AppHeader, HomeMain, SideMenu } from "@/components";

const Page = () => {
  const router = useRouter();

  const handleServiceSelect = (service: string) => {
    router.push(`/task-center?service=${service}`);
  };

  return (
    <div>
      <div className="flex items-start gap-4 pt-8">
        <SideMenu />
        <div className="grow w-full">
          <AppHeader />
          <HomeMain
            selectedService={(service) => handleServiceSelect(service)}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
