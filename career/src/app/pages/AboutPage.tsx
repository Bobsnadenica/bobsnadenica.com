import PageScene from "../layout/PageScene";

const aboutHighlights = [
  {
    value: "Публични профили",
    label: "реални консултанти и ментори с отделна публична страница"
  },
  {
    value: "Ясни роли",
    label: "отделни потоци за потребители, консултанти и партньори"
  },
  {
    value: "Едно табло",
    label: "централно място за профил, документи и предстоящи сесии"
  }
] as const;

const aboutPrinciples = [
  {
    title: "Ясна структура",
    text: "Потребителите трябва да разбират къде се намират, какво могат да направят и каква е следващата полезна стъпка."
  },
  {
    title: "Професионално доверие",
    text: "Профилите, страниците и публичните секции са оформени така, че да изглеждат уверено и сериозно още на първо отваряне."
  },
  {
    title: "Лек процес на работа",
    text: "Регистрацията, входът, профилът и достъпът до кариерни консултанти са подредени с минимално триене и без излишни технически детайли."
  }
] as const;

export default function AboutPage() {
  return (
    <PageScene tone="company" pageKey="about">
      <section className="hero">
        <div className="container page-hero__grid">
          <div className="page-intro">
            <p className="eyebrow">За нас</p>
            <h1>CareerLane е създадена като професионална среда за по-ясни кариерни решения.</h1>
            <p className="hero__lede">
              Платформата свързва професионалисти, консултанти и партньори в по-подреден
              и представителен онлайн формат. Целта ни е хората да намират правилната
              подкрепа по-лесно и да работят от едно ясно място.
            </p>

            <div className="hero-stats">
              {aboutHighlights.map((item) => (
                <div key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="panel page-side-card">
            <p className="eyebrow">Какво стои зад продукта</p>
            <h2>Професионална структура, а не шумен списък.</h2>
            <p>
              В основата на CareerLane са ясно разграничени роли, добра навигация и
              подредено представяне на профили, документи и следващи действия.
            </p>
            <div className="chip-row">
              <span className="chip">Подредено изживяване</span>
              <span className="chip">Ясни роли и профили</span>
              <span className="chip">Професионално присъствие</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container info-grid">
          {aboutPrinciples.map((item) => (
            <article className="info-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </PageScene>
  );
}
