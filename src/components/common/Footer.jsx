import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="page-wrapper footer-inner">
        <div className="footer-ornament">FERRUM ET GLORIA</div>
        <p className="footer-school">Школа исторического фехтования в Кемерово</p>
        <div className="footer-contacts">
          <a href="https://vk.ru/historical_martial_arts_siberia" target="_blank" rel="noopener noreferrer">vk.ru/historical_martial_arts_siberia</a>
          <span className="footer-sep">·</span>
          <a href="mailto:ferrum.gloria@mail.ru">ferrum.gloria@mail.ru</a>
          <span className="footer-sep">·</span>
          <a href="tel:+79000000000">+7 (900) 000-00-00</a>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} Все права защищены</p>
      </div>
    </footer>
  )
}
