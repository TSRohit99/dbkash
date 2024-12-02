import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import React, { useState } from 'react';
import toast from "react-hot-toast";

interface prop {
    address : string;
}

const Copybtn : React.FC<prop> = ({address}) => {

    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(address);
      toast.success('Successfully Copied to the clipboard!')
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

  return (
    <Button
    variant="ghost"
    size="sm"
    onClick={handleCopy}
    className="hover:bg-blue-800/20 h-8 w-8 p-0"
  >
    {copied ? (
      <Check className="w-4 h-4 text-green-400" />
    ) : (
      <Copy className="w-4 h-4 text-blue-400" />
    )}
  </Button>
  )
}

export default Copybtn