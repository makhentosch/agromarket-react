// Список оптовых заявок — виден только администратору
function OrdersList({ orders, error }) {
  return (
    <section id="orders" className="contact">
      <h2>Заявки</h2>
      {error && <div className="error">{error}</div>}
      {!error && orders.length === 0 && <p className="status">Заявок пока нет</p>}
      {orders.length > 0 && (
        <div className="table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Имя / организация</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Объём, кг</th>
                <th>Дата доставки</th>
                <th>Комментарий</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.name}</td>
                  <td>{order.email}</td>
                  <td>{order.phone || '—'}</td>
                  <td>{order.volume}</td>
                  <td>{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('ru-RU') : '—'}</td>
                  <td>{order.comment || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default OrdersList;
