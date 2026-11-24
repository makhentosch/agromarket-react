import Catalog from '../components/Catalog';
import ContactForm from '../components/ContactForm';
import { useAuth } from '../context/AuthContext';

function CatalogPage({ onAdd = () => {} }) {
  const { isAdmin } = useAuth();

  return (
    <main className="page">
      <Catalog isAdmin={isAdmin} onAdd={onAdd} />

      <aside id="delivery" className="sidebar">
        <h3>Доставка</h3>
        <ul>
          <li>Астана - на следующий день</li>
          <li>Акмолинская область - 2-3 дня</li>
          <li>Бесплатно от 20 000 тг</li>
        </ul>
      </aside>

      <ContactForm />
    </main>
  );
}

export default CatalogPage;
