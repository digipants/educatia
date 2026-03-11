const sections = [
  {
    title: "1. Information We Collect",
    content: [
      "A. Personal Information: We may collect name, email address, phone number, address, date of birth (if required), ID details (where legally required), donation details, and volunteer or participant information.",
      "B. Sensitive Personal Data (only when necessary): Bank or payment transaction details processed through secure payment gateways, and identity verification documents where required for legal compliance.",
      "C. Automatically Collected Information: IP address, browser type, device information, pages visited, cookies, and usage analytics.",
    ],
  },
  {
    title: "2. Purpose of Data Collection",
    content: [
      "We use personal data to process donations, issue receipts and tax certificates, register participants for programs and seminars, communicate updates, maintain donor and volunteer records, improve website functionality, and comply with legal obligations.",
      "We do not sell or trade personal data.",
    ],
  },
  {
    title: "3. Legal Basis for Processing (GDPR Compliance)",
    content: [
      "Where GDPR applies, data may be processed based on user consent, legitimate charitable interests, legal compliance obligations, and contractual necessity for donations or event registrations.",
      "Users may withdraw consent at any time.",
    ],
  },
  {
    title: "4. Cookies Policy",
    content: [
      "Our website may use cookies to enhance user experience, analyze website traffic, and remember user preferences.",
      "Users can disable cookies through browser settings.",
    ],
  },
  {
    title: "5. Data Sharing and Disclosure",
    content: [
      "We may share information only with payment gateway providers, government authorities where legally required, auditors or legal advisors, and technology service providers under confidentiality obligations.",
      "We do not share personal data for commercial marketing.",
    ],
  },
  {
    title: "6. Data Security",
    content: [
      "We implement reasonable safeguards including secure servers, SSL encryption where applicable, restricted access controls, and administrative protections.",
      "No method of internet transmission is fully guaranteed to be 100 percent secure.",
    ],
  },
  {
    title: "7. Data Retention",
    content: [
      "Personal data is retained only as long as necessary for charitable operations, accounting and statutory compliance, audits, and legal purposes.",
    ],
  },
  {
    title: "8. User Rights (GDPR and Indian Law)",
    content: [
      "Users may request access to personal data, correction of inaccurate data, deletion subject to legal requirements, withdrawal of consent, and restriction of processing.",
      "Requests can be sent to our contact email.",
    ],
  },
  {
    title: "9. Children's Privacy",
    content: [
      "The Trust may conduct educational programs involving minors. Children's data is collected only with parent or guardian consent, or through authorized institutions.",
    ],
  },
  {
    title: "10. Third-Party Links",
    content: [
      "Our website may include links to external websites. We are not responsible for their privacy practices. Users should review the privacy policies of those websites.",
    ],
  },
  {
    title: "11. International Data Transfers",
    content: [
      "If users access this website from outside India, their data may be processed and stored in India where data protection laws may differ.",
      "By using the website, users consent to such transfer.",
    ],
  },
  {
    title: "12. Policy Updates",
    content: [
      "Educatia Welfare Trust reserves the right to modify this Privacy Policy at any time. Updated versions will be posted on this page with a revised effective date.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-12 space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="text-slate-700 leading-relaxed">
          Educatia Welfare Trust is committed to protecting the privacy and
          personal information of visitors, donors, volunteers, beneficiaries,
          and users of this website.
        </p>
        <p className="text-sm text-slate-600">Effective date: March 9, 2026</p>
      </section>

      {sections.map((section) => (
        <section key={section.title} className="card space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">
            {section.title}
          </h2>
          {section.content.map((text) => (
            <p key={text} className="text-sm text-slate-700 leading-relaxed">
              {text}
            </p>
          ))}
        </section>
      ))}

      <section className="card space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Contact</h2>
        <p className="text-sm text-slate-700">
          For privacy-related requests, contact us at{" "}
          <a
            href="mailto:educatiawelfaretrust@gmail.com"
            className="text-brand-primary hover:underline"
          >
            educatiawelfaretrust@gmail.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
