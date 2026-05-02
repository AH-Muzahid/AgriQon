"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui"

const faqs = [
  {
    question: "How do I become a verified dealer?",
    answer: "To become a verified dealer, submit your business registration documents through your dashboard. Our team will review and verify your credentials within 2-3 business days.",
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept bank transfers, debit/credit cards, and mobile money. All transactions are secured through our payment partners.",
  },
  {
    question: "How does delivery work?",
    answer: "We partner with verified logistics providers. Delivery typically takes 2-5 business days depending on your location. You can track your order in real-time.",
  },
  {
    question: "Can I return products?",
    answer: "Yes, within 7 days of delivery if the product is unused and in original packaging. Contact support to initiate a return.",
  },
  {
    question: "How do I contact customer support?",
    answer: "Reach us via live chat, email at support@agriqon.com, or call our hotline. We're available 24/7 for urgent issues.",
  },
]

export function FAQSection() {
  return (
    <section className="faq-section">
      <div className="section-heading">
        <h2>Frequently Asked Questions</h2>
      </div>
      
      <Accordion type="single" collapsible className="faq-list">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              <span>{faq.question}</span>
            </AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
