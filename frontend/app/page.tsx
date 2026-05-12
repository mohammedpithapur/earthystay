import Hero from '@/components/layout/Hero'
import TrustSignals from '@/components/layout/TrustSignals'
import FeaturedProperties from '@/components/property/FeaturedProperties'
import CTASection from '@/components/layout/CTASection'
import WhyChooseUs from '@/components/layout/WhyChooseUs'
import SecurityPayment from '@/components/layout/SecurityPayment'

export default function Home() {
  return (
    <>
      <Hero />
      <TrustSignals />
      <FeaturedProperties />
      <CTASection />
      <WhyChooseUs />
      <SecurityPayment />
    </>
  )
}