import Link from "next/link";

const Footer = () => {
  return (
    <>
      <footer className="py-[64px] container mx-auto max-md:px-[20px]">
        <div className="flex items-start justify-between flex-wrap max-md:gap-8">
          <div className="md:basis-1/3 basis-full space-y-4">
            <p className="text-[28px] leading-[32px] font-bold text-light-text-color">
              Subscribe to our newsletter
            </p>
            <img
              src="/assets/logo-icon.svg"
              alt="logo"
              className="w-[224px] h-[224px]"
            />
            <div className="border-b-[1px] border-b-[#4C4B47] px-0 py-2 flex items-center gap-2 max-w-[350px]">
              <input
                className="border-none outline-none text-[14px] text-light-text-color placeholder:text-placeholder-text w-full"
                placeholder="you@email.com"
                style={{ background: "none" }}
              />
              <img
                src="/assets/primary-arrow-icon.svg"
                alt="primary"
                className="w-3 h-[10px] flex-shrink-0"
              />
            </div>
          </div>
          <div className="md:basis-1/3 basis-full flex items-start justify-between">
            <div className="basis-1/2 flex flex-col items-baseline gap-3">
              {[
                "Docs",
                "Audit",
                "Blog",
                "Press Kit",
                "Privacy Policy",
                "Terms of Use",
              ].map((link, index) => (
                <div key={`${link}-${index}`}>
                  <Link
                    href={"/"}
                    rel="noreferrer noopener"
                    target="_blank"
                    className="text-light-text-color text-[18px] leading-[25.2px]"
                  >
                    {link}
                  </Link>
                </div>
              ))}
            </div>
            <div className="basis-1/2 flex flex-col items-baseline gap-3">
              {["X", "Telegram", "Discord", "Farcaster"].map((link, index) => (
                <div key={`${link}-${index}`}>
                  <Link
                    key={`${link}-${index}`}
                    href={"/"}
                    rel="noreferrer noopener"
                    target="_blank"
                    className="text-light-text-color text-[18px] leading-[25.2px]"
                  >
                    {link}
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div className="md:basis-1/4 basis-full space-y-4 text-left">
            <div className="space-y-2">
              <p className="text-placeholder-text text-[14px] leading-[19.2px]">
                EMAIL US
              </p>
              <p className="text-alternate-black-text-color text-[14px] leading-[19.2px]">
                team@ansemble.ai
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
