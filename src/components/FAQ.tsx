import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
  
  const FAQ = () => {
    const faqs = [
      {
        q: "Is it decentralized",
        ans: "Yes, it's fully decentralized hosted on Arbitrum Blockchain.",
      },
      {
        q: "Can I swap my BDT to USD",
        ans: "You can, after the implementation of Swap.",
      },
      {
        q: "Which Self-Custody wallet I should use",
        ans: "For now use Metamask.",
      },
    ];
    
    return (
        <div id="faq"> 
         <div className='text-3xl md:text-4xl text-center text-white font-extrabold mb-5 pt-3 '>FAQs</div>
        <Accordion type="single" collapsible className="w-full  px-3 md:px-60 ">
        {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-white">{faq.q}?</AccordionTrigger>
            <AccordionContent>{faq.ans}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      </div>
    );
  };
  
  export default FAQ;
  