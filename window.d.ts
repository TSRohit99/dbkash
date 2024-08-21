
interface Window {
    ethereum?: {
      on(arg0: string, arg1: (accounts: string[]) => void): unknown;
      isMetaMask?: boolean;
      request?: (args: { method: string; params?: Array<any> }) => Promise<any>;
    };
  }
  