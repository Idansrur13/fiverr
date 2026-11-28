import { HomeHero } from '../cmps/HomeHero'
import { CategoryCards } from '../cmps/CategoryCards'
import { PopularServices } from '../cmps/PopularServices'

export function HomePage() {
  return (
    <section className="home-page full main-layout">
      <HomeHero />
      <CategoryCards />
      <PopularServices />
    </section>
  )
}
