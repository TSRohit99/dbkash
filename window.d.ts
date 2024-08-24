
interface Window {
  ethereum?: {
    on(eventName: string, listener: (...args: any[]) => void): unknown;
    removeListener(eventName: string, listener: (...args: any[]) => void): unknown;
    isMetaMask?: boolean;
    request?: (args: { method: string; params?: Array<any> }) => Promise<any>;
  };
}