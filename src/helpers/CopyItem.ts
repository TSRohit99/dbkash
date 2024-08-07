"use client"
import toast from "react-hot-toast";

export const copyToClipboard = async (address : string | null) => {
 
    if (!address) {
        toast.error('No address to copy!')
      return;
    }
  
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(address);
        toast.success('Successfully Copied to the clipboard!')

      
      } else {
        fallbackCopyTextToClipboard(address);
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error('Intial step failed, checking with anoth function.')
      fallbackCopyTextToClipboard(address);
    }
  };
  
  export const fallbackCopyTextToClipboard = (text : string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand("copy");
      toast.success('FallBack : Successfully Copied to the clipboard!')
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
      toast.error('Fallback: Oops, unable to copy')
    }
    document.body.removeChild(textArea);
  };
  