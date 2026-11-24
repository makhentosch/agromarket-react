import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { apiFetch } from '../api';
import ProductForm from '../components/ProductForm';
import OrdersList from '../components/OrdersList';
import { useAuth } from '../context/AuthContext';

// Админка: добавление товаров и список заявок. Гостя отправляем на вход
function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState(null);
  const [created, setCreated] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      setOrdersError(null);
      setOrders(await apiFetch('/orders'));
    } catch (err) {
      setOrdersError(err.message);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadOrders();
    }
  }, [isAdmin, loadOrders]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <main className="page page--narrow">
        <div className="error" role="alert">Нет доступа: раздел только для администратора</div>
      </main>
    );
  }

  return (
    <main className="page page--narrow">
      <h1>Админка</h1>

      <ProductForm onCreated={setCreated} />
      {created && (
        <p className="success">
          Товар «{created.name}» добавлен. <Link to="/">Перейти в каталог</Link>
        </p>
      )}

      <OrdersList orders={orders} error={ordersError} />
    </main>
  );
}

export default AdminPage;
