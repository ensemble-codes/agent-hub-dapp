import { baseSepolia } from "viem/chains";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";

const AppHeader = () => {
  const { connect } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <>
      <div className="w-full flex items-start justify-between">
        <div className="space-y-1">
          <img
            src="/assets/logo-icon.svg"
            alt="logo"
            className="w-[60px] h-[56px]"
          />
          <p className="font-spaceranger text-[28px] leading-[25px] font-[400] text-text-color">
            AGENT <span className="text-primary">HUB</span>
          </p>
        </div>
        <div className="text-center space-y-2">
          <span className="bg-gradient-to-r from-primary to-[#FF9D78] inline-block text-transparent bg-clip-text text-[40px] leading-[54px] font-[700]">
            Assign AI agents
          </span>
          <p className="text-[24px] leading-[32.4px] font-[400]">
            for Crypto tasks
          </p>
        </div>
        {isConnected ? (
          <button
            className="w-auto mt-6 space-x-2 flex items-center justify-between rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
            onClick={() => disconnect()}
          >
            <span className="text-white text-[16px] font-[700] leading-[24px]">
              {address?.slice(0, 5)}...{address?.slice(-5)}
            </span>
          </button>
        ) : (
          <button
            className="w-auto mt-6 space-x-2 flex items-center justify-between rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
            onClick={() =>
              connect({ connector: metaMask(), chainId: baseSepolia.id })
            }
          >
            <img src="/assets/connect-wallet-icon.svg" alt="connect-wallet" />
            <span className="text-white text-[16px] font-[700] leading-[24px]">
              Connect Wallet
            </span>
          </button>
        )}
      </div>
    </>
  );
};

export default AppHeader;
