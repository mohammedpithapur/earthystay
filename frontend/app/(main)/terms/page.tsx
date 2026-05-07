'use client'
import Link from 'next/link'

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: [
      {
        subtitle: 'Agreement to Terms',
        text: 'By accessing or using the Earthy Stay website and services, you confirm that you are at least 18 years of age, have read and understood these Terms & Conditions, and agree to be bound by them. If you do not agree to these terms, please do not use our services.',
      },
      {
        subtitle: 'Modifications',
        text: 'Earthy Stay reserves the right to modify these terms at any time. We will notify users of significant changes via email or a prominent notice on our website. Your continued use of our services after any modification constitutes acceptance of the updated terms.',
      },
    ],
  },
  {
    id: 'bookings',
    title: '2. Bookings & Reservations',
    content: [
      {
        subtitle: 'Booking Process',
        text: 'All bookings made through Earthy Stay are subject to availability and confirmation. A booking is only confirmed once you receive a written confirmation email with a booking reference number. We reserve the right to decline or cancel bookings at our discretion.',
      },
      {
        subtitle: 'Accurate Information',
        text: 'You are responsible for ensuring all information provided during booking is accurate, including guest count, dates, and contact details. Any discrepancies may result in additional charges or cancellation of your booking.',
      },
      {
        subtitle: 'Minimum Stay Requirements',
        text: 'Many of our properties have minimum stay requirements, particularly during peak seasons and holidays. These requirements are clearly stated on each property listing and must be adhered to at the time of booking.',
      },
      {
        subtitle: 'Guest Limits',
        text: 'The number of guests staying at a property must not exceed the maximum occupancy stated in the property listing. Exceeding this limit may result in immediate termination of your stay without refund.',
      },
    ],
  },
  {
    id: 'payment',
    title: '3. Payment Terms',
    content: [
      {
        subtitle: 'Payment Methods',
        text: 'We accept payments through Razorpay, which supports UPI, credit/debit cards, net banking, and other payment methods. All transactions are processed in Indian Rupees (INR) and are subject to Razorpay\'s terms of service.',
      },
      {
        subtitle: 'Full Payment',
        text: 'Full payment is required at the time of booking to confirm your reservation. We do not offer instalment plans or partial payments unless explicitly stated for a specific property or offer.',
      },
      {
        subtitle: 'Price Accuracy',
        text: 'While we strive to ensure all pricing on our platform is accurate, errors may occasionally occur. In the event of a pricing error, we will notify you and give you the option to proceed at the correct price or cancel your booking for a full refund.',
      },
    ],
  },
  {
    id: 'cancellation',
    title: '4. Cancellation & Refund Policy',
    content: [
      {
        subtitle: 'Non-Refundable Bookings',
        text: 'All bookings made through Earthy Stay are strictly non-refundable. Once a booking is confirmed and payment is processed, the full amount is charged and cannot be refunded under any circumstances, including but not limited to personal emergencies, illness, travel disruptions, or change of plans.',
      },
      {
        subtitle: 'No Modifications',
        text: 'Confirmed bookings cannot be modified, including changes to dates, guest counts, or property. If you wish to make changes, your current booking must be cancelled (without refund) and a new booking made, subject to availability.',
      },
      {
        subtitle: 'Property Unavailability',
        text: 'In the rare event that a property becomes unavailable after your booking is confirmed due to circumstances beyond our control, we will make every effort to offer you an equivalent alternative property. If no suitable alternative is available, a full refund will be provided.',
      },
    ],
  },
  {
    id: 'property-rules',
    title: '5. Property Rules & Guest Conduct',
    content: [
      {
        subtitle: 'House Rules Compliance',
        text: 'All guests are required to comply with the house rules specified for each property. These rules are displayed on the property listing and must be reviewed before booking. Violation of house rules may result in immediate eviction without refund.',
      },
      {
        subtitle: 'Check-in & Check-out',
        text: 'Guests must adhere to the check-in and check-out times specified for each property. Early check-in or late check-out may be available upon request and at the property\'s discretion, potentially subject to additional charges.',
      },
      {
        subtitle: 'Property Care',
        text: 'Guests are responsible for taking reasonable care of the property and its contents. Any damage caused during your stay beyond normal wear and tear will be charged to the payment method on file.',
      },
      {
        subtitle: 'Prohibited Activities',
        text: 'Illegal activities, excessive noise, parties (unless explicitly permitted), and any behaviour that disturbs neighbours or other guests is strictly prohibited. We reserve the right to terminate a booking immediately for violations.',
      },
    ],
  },
  {
    id: 'pets',
    title: '6. Pet Policy',
    content: [
      {
        subtitle: 'Pet-Friendly Properties',
        text: 'Only properties explicitly marked as "Pet Friendly" on our platform allow pets. Bringing a pet to a non-pet-friendly property is a violation of these terms and may result in immediate eviction without refund.',
      },
      {
        subtitle: 'Pet Charges',
        text: 'Properties that accept pets charge an additional nightly fee per pet, clearly stated on the property listing. This charge is added to your total at the time of booking. Pet owners are responsible for any damage caused by their animals.',
      },
    ],
  },
  {
    id: 'liability',
    title: '7. Limitation of Liability',
    content: [
      {
        subtitle: 'Platform Role',
        text: 'Earthy Stay acts as an intermediary platform connecting guests with property owners. We are not responsible for the condition, safety, or accuracy of property descriptions beyond our verification process. We strongly recommend reviewing all property information carefully before booking.',
      },
      {
        subtitle: 'Limitation',
        text: 'To the maximum extent permitted by applicable law, Earthy Stay shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our platform or services. Our total liability shall not exceed the amount paid for the specific booking in question.',
      },
      {
        subtitle: 'Force Majeure',
        text: 'Earthy Stay shall not be liable for any failure to perform obligations where such failure is caused by circumstances beyond our reasonable control, including natural disasters, government actions, pandemics, or other force majeure events.',
      },
    ],
  },
  {
    id: 'intellectual-property',
    title: '8. Intellectual Property',
    content: [
      {
        subtitle: 'Our Content',
        text: 'All content on the Earthy Stay platform, including text, images, logos, and software, is the property of Earthy Stay or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.',
      },
      {
        subtitle: 'User Content',
        text: 'By submitting reviews, photos, or other content to our platform, you grant Earthy Stay a non-exclusive, royalty-free licence to use, reproduce, and display such content in connection with our services.',
      },
    ],
  },
  {
    id: 'governing-law',
    title: '9. Governing Law',
    content: [
      {
        subtitle: 'Jurisdiction',
        text: 'These Terms & Conditions are governed by the laws of India. Any disputes arising from or relating to these terms or your use of our services shall be subject to the exclusive jurisdiction of the courts of India.',
      },
      {
        subtitle: 'Dispute Resolution',
        text: 'We encourage you to contact us first to resolve any disputes informally. If a dispute cannot be resolved informally, it shall be submitted to binding arbitration in accordance with the Arbitration and Conciliation Act, 1996.',
      },
    ],
  },
  {
    id: 'contact',
    title: '10. Contact Information',
    content: [
      {
        subtitle: 'Reach Us',
        text: 'For any questions, concerns, or notices regarding these Terms & Conditions, please contact us at legal@earthystay.com or through our Contact page. We aim to respond to all enquiries within 3 business days.',
      },
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="page-shell" style={{ backgroundColor: '#ffffff' }}>

      {/* Hero */}
      <div style={{ backgroundColor: 'var(--color-navbar)', padding: '72px 24px 64px' }}>
        <div className="content-shell" style={{ textAlign: 'center' }}>
          <p style={{ color: '#e1c391', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '600' }}>
            Legal
          </p>
          <h1 style={{ color: '#1a1a1a', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2' }}>
            Terms & Conditions
          </h1>
          <div style={{ width: '60px', height: '2px', backgroundColor: '#e1c391', margin: '0 auto 24px' }} />
          <p style={{ color: 'rgba(26,26,26,0.72)', fontSize: '15px', maxWidth: '560px', margin: '0 auto', lineHeight: '1.7' }}>
            Please read these terms carefully before using our platform. By booking with Earthy Stay, you agree to be bound by the following terms and conditions.
          </p>
          <p style={{ color: '#888', fontSize: '13px', marginTop: '24px' }}>
            Effective Date: 1st January 2025 &nbsp;·&nbsp; Last Updated: 1st January 2025
          </p>
        </div>
      </div>

      {/* Important Notice */}
      <div style={{ backgroundColor: '#fffdf5', borderBottom: '1px solid #e1c391' }}>
        <div className="content-shell" style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.7', textAlign: 'center' }}>
            <strong>Important:</strong> All bookings made through Earthy Stay are <strong>strictly non-refundable</strong>. Please review our cancellation policy in Section 4 before making a reservation.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="content-shell" style={{ padding: '64px 24px 80px' }}>

        {/* Table of Contents */}
        <div style={{ backgroundColor: '#ede8d0', border: '1px solid #e0d9c0', borderRadius: '12px', padding: '32px', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '20px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Table of Contents
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                style={{ color: '#555', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s ease' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#e1c391'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#555'}
              >
                <span style={{ color: '#e1c391', fontSize: '10px' }}>→</span>
                {section.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {sections.map((section) => (
            <div key={section.id} id={section.id} style={{ scrollMarginTop: '100px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: '800', color: '#1a1a1a', whiteSpace: 'nowrap' }}>
                  {section.title}
                </h2>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e0d9c0' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {section.content.map((item, i) => (
                  <div
                    key={i}
                    style={{ paddingLeft: '20px', borderLeft: `3px solid ${section.id === 'cancellation' ? '#E53E3E' : '#e1c391'}` }}
                  >
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
                      {item.subtitle}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.8' }}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: '64px', backgroundColor: '#fffdf5', border: '1px solid #e1c391', borderRadius: '12px', padding: '32px', display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>Need Clarification?</h3>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.7' }}>
              If any part of these terms is unclear, please reach out to us before making a booking.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href="mailto:legal@earthystay.com"
              style={{ backgroundColor: '#e1c391', color: '#1a1a1a', padding: '12px 24px', fontSize: '13px', letterSpacing: '1px', fontWeight: '700', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '8px', display: 'inline-block' }}
            >
              Email Legal Team
            </a>
            <Link
              href="/contact"
              style={{ border: '1px solid #e0d9c0', color: '#1a1a1a', padding: '12px 24px', fontSize: '13px', letterSpacing: '1px', fontWeight: '600', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '8px', display: 'inline-block' }}
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Related Links */}
        <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Cancellation Policy', href: '/cancellation' },
            { label: 'Contact Us', href: '/contact' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{ fontSize: '13px', color: '#888', textDecoration: 'none', padding: '8px 16px', border: '1px solid #e0d9c0', borderRadius: '6px', transition: 'all 0.2s ease' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e1c391'
                ;(e.currentTarget as HTMLAnchorElement).style.color = '#1a1a1a'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e0d9c0'
                ;(e.currentTarget as HTMLAnchorElement).style.color = '#888'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}