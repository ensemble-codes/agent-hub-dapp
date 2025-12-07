'use client';
import Link from "next/link";
import { useState } from "react";
import { captureError, addBreadcrumb } from "@/utils/error-tracking";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event bubbling

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Get the email value to validate
    const email = form.querySelector('input[type="email"]') as HTMLInputElement;

    if (!email?.value) {
      setEmailError("Please enter your email address");
      addBreadcrumb({
        category: "newsletter",
        message: "Newsletter subscription validation failed",
        level: "warning",
      });
      return;
    }

    // Add breadcrumb for tracking
    addBreadcrumb({
      category: "newsletter",
      message: "Newsletter subscription attempt",
      level: "info",
      data: {
        email: email.value,
      },
    });

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        mode: "no-cors", // This is required for Mailchimp
      });

      // With no-cors mode, we can't read the response, but we can assume success
      setEmailSubmitted(true);
      setEmailError("");
      setSubmitStatus("success");

      // Add success breadcrumb
      addBreadcrumb({
        category: "newsletter",
        message: "Newsletter subscription successful",
        level: "info",
        data: {
          email: email.value,
        },
      });

      // Reset form
      form.reset();
    } catch (error) {
      console.error("Mailchimp submission error:", error);
      setEmailError("Something went wrong. Please try again.");
      setSubmitStatus("error");
      
      // Capture error
      captureError(error as Error, {
        component: "Footer",
        action: "newsletter_subscription",
        email: email.value,
      });
    }
  };

  if (pathname.includes('/chat')) return;

  return (
    <>
      <footer className="max-lg:mb-[40px] lg:container lg:mx-auto flex lg:flex-row flex-col items-start justify-start lg:gap-[156px] gap-[64px] lg:mb-[120px] max-lg:px-[16px]">
        <div>
          <h6 className="font-medium text-[18px] text-[#121212] mb-[40px]">
            Join Newsletter
          </h6>
          <form 
            onSubmit={handleNewsletterSubmit} 
            action="https://codes.us22.list-manage.com/subscribe/post?u=f6e3f626bf75a88cc7cab221d&id=0004be5780&f_id=00cdc2e1f0"
            method="post"
            id="mc-embedded-subscribe-form"
            name="mc-embedded-subscribe-form"
            className="flex flex-col gap-6 mb-[40px]"
          >
            <label
              htmlFor="newsletter"
              className="text-[16px] font-light text-[#000]"
            >
              Email
            </label>
            <div className="flex items-center gap-5">
              <input
                type="email"
                name="EMAIL"
                id="newsletter"
                placeholder="Enter your email"
                required
                className="border-none bg-black/5 lg:p-6 p-3 rounded-[30px] placeholder:text-black/75 text-[16px] font-light text-[#000] outline-none"
              />
              <button 
                type="submit"
                disabled={emailSubmitted}
                className="bg-gradient-to-r from-[#fff]/40 to-[#fff]/14 rounded-[40px] border-none outline-none font-medium text-[16px] text-[#000] py-4 px-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailSubmitted ? "Subscribed!" : "Subscribe"}
              </button>
              <div
                aria-hidden="true"
                style={{ position: "absolute", left: "-5000px" }}
              >
                <input
                  type="text"
                  name="b_f6e3f626bf75a88cc7cab221d_0004be5780"
                  tabIndex={-1}
                  value=""
                />
              </div>
            </div>
            {emailError && (
              <p className="text-red-600 text-[14px] font-light">
                {emailError}
              </p>
            )}
            {emailSubmitted && (
              <p className="text-green-600 text-[14px] font-light">
                Thanks! You've been added to our newsletter.
              </p>
            )}
          </form>
          <div className="flex items-center gap-6">
            <Link
              href={`https://t.me/+V2yQK15ZYLw3YWU0`}
              target="_blank"
              rel="noreferrer noopener"
              className="w-7 h-7 flex items-center justify-center rounded-full border border-black"
            >
              <img
                src={"/assets/telegram-footer-icon.svg"}
                alt="telegram"
                className="w-5 h-5"
              />
            </Link>
            <Link
              href={`https://x.com/EnsembleCodes`}
              target="_blank"
              rel="noreferrer noopener"
              className="w-7 h-7 flex items-center justify-center rounded-full border border-black"
            >
              <img src={"/assets/x-footer-icon.svg"} alt="x" className="w-5 h-5" />
            </Link>
            <Link
              href={`https://linktr.ee/ensemble.codes`}
              target="_blank"
              rel="noreferrer noopener"
              className="w-7 h-7 flex items-center justify-center rounded-full border border-black"
            >
              <img
                src={"/assets/linktree-footer-icon.svg"}
                alt="linktree"
                className="w-5 h-5"
              />
            </Link>
            <Link
              href={`https://www.linkedin.com/company/ensemble-codes`}
              target="_blank"
              rel="noreferrer noopener"
              className="w-7 h-7 flex items-center justify-center rounded-full border border-black"
            >
              <img
                src={"/assets/linkedin-footer-icon.svg"}
                alt="linkedin"
                className="w-5 h-5"
              />
            </Link>
            <Link
              href={`https://github.com/ensemble-codes`}
              target="_blank"
              rel="noreferrer noopener"
              className="w-7 h-7 flex items-center justify-center rounded-full border border-black"
            >
              <img
                src={"/assets/github-footer-icon.svg"}
                alt="github"
                className="w-5 h-5"
              />
            </Link>
          </div>
        </div>
        <div className="flex items-start lg:justify-start justify-between lg:gap-[156px] max-lg:w-full">
          <div className="max-lg:basis-1/2">
            <h6 className="font-medium text-[18px] text-[#121212] mb-[40px]">
              Company
            </h6>
            <span className="text-[16px] block font-light leading-[100%] text-black/50 hover:text-black transition-colors duration-300 ease-in-out mb-5">
              For any inquiries -
            </span>
            <Link
              href={`mailto:hello@ensemble.codes`}
              className="text-[16px] block font-light leading-[100%] text-black/50 hover:text-black transition-colors duration-300 ease-in-out mb-5"
            >
              hello@ensemble.codes
            </Link>
          </div>
          <div className="max-lg:basis-1/2 max-lg:text-end">
            <h6 className="font-medium text-[18px] text-[#121212] mb-[40px]">
              Support
            </h6>
            <Link
              href={`https://t.me/+V2yQK15ZYLw3YWU0`}
              target="_blank"
              rel="noreferrer noopener nofollower"
              className="text-[16px] block font-light leading-[100%] text-black/50 hover:text-black transition-colors duration-300 ease-in-out mb-5"
            >
              Help Center
            </Link>
            <span
              onClick={() => {
                document
                  .getElementById("faq")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-[16px] block font-light leading-[100%] text-black/50 hover:text-black transition-colors duration-300 ease-in-out mb-5 cursor-pointer"
            >
              FAQs
            </span>
          </div>
        </div>
      </footer>
      <div className="container mx-auto mb-[120px] max-lg:px-[16px]">
        <h6 className="text-[20px] text-primary font-medium">Agent Hub</h6>
        <p className="font-normal text-[#8F95B2] text-[16px]">
          © 2025 All rights reserved
        </p>
      </div>
      <style jsx global>{`
        .team-shadow {
          box-shadow: 0px 1.67px 16.67px 0px rgba(143, 149, 178, 0.68);
        }
      `}</style>
    </>
  );
};

export default Footer;
