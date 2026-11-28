import { HomeHero } from '../cmps/HomeHero'
import { PopularServices } from '../cmps/PopularServices'

export function HomePage() {
  return (
    <section className="home-page full main-layout">
      <HomeHero />
      <PopularServices />
    </section>
  )
}
