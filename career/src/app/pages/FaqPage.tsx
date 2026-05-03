import { Link } from "react-router-dom";
import PageScene from "../layout/PageScene";

const faqItems = [
  {
    question: "Какво получават потребителите безплатно?",
    answer:
      "Потребителите използват CareerLane без платено членство на този етап. Те могат да създадат профил, да добавят основна информация и CV, да разглеждат активните консултанти и ментори и да заявяват консултации."
  },
  {
    question: "Могат ли консултантите да използват платформата безплатно?",
    answer:
      "Да. Консултантите и менторите могат да създадат публичен профил, който да бъде откриваем, отваряем и споделяем, без да е нужна допълнителна активация в текущата версия."
  },
  {
    question: "Показват ли се публично консултантските тарифи?",
    answer:
      "Не. В текущата публична версия акцентът е върху профила, експертизата и свободните слотове, а не върху видими тарифи."
  },
  {
    question: "Как работи регистрацията и потвърждението?",
    answer:
      "Регистрацията е организирана като един ясен поток с директен достъп до профила след създаването му. Потвърждението е част от този процес и не изисква отделен бутон на входната страница."
  },
  {
    question: "Има ли forgot password процес?",
    answer:
      "Да. На страницата за вход има отделен поток за забравена парола с изпращане на код и въвеждане на нова парола."
  },
  {
    question: "Какви документи могат да се пазят в профила?",
    answer:
      "Профилът започва с основен CV документ и ключова информация за професионалния контекст. Структурата е подготвена да се разширява с дипломи, портфолио и допълнителни материали с развитието на услугата."
  },
  {
    question: "Как се заявява рекламна позиция?",
    answer:
      "Партньорите могат да използват рекламната зона и страницата за контакти, където са описани каналите за партньорски и рекламни заявки."
  },
  {
    question: "Гарантира ли платформата наемане или кариерен резултат?",
    answer:
      "Не. CareerLane предоставя среда за професионално позициониране и консултации, но не гарантира конкретен резултат при кандидатстване, интервю или наемане."
  }
] as const;

export default function FaqPage() {
  return (
    <PageScene tone="support" pageKey="faq">
      <section className="hero">
        <div className="container page-hero__grid">
          <div className="page-intro">
            <p className="eyebrow">FAQ</p>
            <h1>Отговори на най-честите въпроси за платформата, акаунтите и достъпа.</h1>
            <p className="hero__lede">
              FAQ страницата е подредена така, че нов потребител, консултант или партньор
              да получи бърза ориентация без да търси информация в отделни секции.
            </p>
          </div>

          <aside className="panel page-side-card">
            <p className="eyebrow">Полезни връзки</p>
            <h2>Още помощ</h2>
            <div className="helper-grid helper-grid--single">
              <article className="helper-card">
                <strong>Контакти</strong>
                <p>За въпроси извън FAQ използвай страницата за контакти.</p>
                <Link className="ghost-button" to="/contact">
                  Отвори контактите
                </Link>
              </article>
              <article className="helper-card">
                <strong>Правна информация</strong>
                <p>За условия, privacy и правни детайли виж правната страница.</p>
                <Link className="ghost-button" to="/legal">
                  Отвори правната страница
                </Link>
              </article>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container faq-list">
          {faqItems.map((item, index) => (
            <details className="faq-item" key={item.question} open={index === 0}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </PageScene>
  );
}
