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
      <AppHeader />
      <div className="flex items-start gap-16 pt-16">
        <SideMenu />
        <HomeMain selectedService={(service) => handleServiceSelect(service)} />
      </div>
    </div>
  );
};

export default Page;
