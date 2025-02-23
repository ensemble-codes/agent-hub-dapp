"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader, HomeMain, SideMenu, TaskDetails } from "../components";
import { Suspense } from 'react'

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppHeader />
      <InernalHome />
    </Suspense>
  );
}

function InernalHome() {

  const router = useRouter();

  const searchParams = useSearchParams();
  const selectedService = searchParams.get("service");

  const handleServiceSelect = (service: string) => {
    router.push(`?service=${service}`);
  };

  return (
      <div className="flex items-start gap-16 pt-16">
      <SideMenu />
      {!selectedService ? (
        <HomeMain 
          selectedService={(service) => handleServiceSelect(service)}
        />
      ) : (
        <TaskDetails selectedService={selectedService} />
      )}
    </div>
  )

}