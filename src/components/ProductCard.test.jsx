import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from './ProductCard';

// NUMERIC из PostgreSQL приходит строкой - как в настоящем ответе API
const product = { id: 6, name: 'Мёд натуральный', category: 'Мёд', price: '4500.00', unit: 'л' };

describe('ProductCard', () => {
  test('показывает название и цену за единицу', () => {
    render(<ProductCard product={product} onAdd={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Мёд натуральный' })).toBeInTheDocument();
    expect(screen.getByText('4500 тг / л')).toBeInTheDocument();
  });

  test('кнопка «В корзину» вызывает onAdd с товаром', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn(); // «шпион»: запоминает, как его вызвали
    render(<ProductCard product={product} onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: /в корзину/i }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(product);
  });

  test('без onDelete кнопки «Удалить» нет (покупатель)', () => {
    render(<ProductCard product={product} onAdd={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /удалить/i })).not.toBeInTheDocument();
  });

  test('у админа кнопка «Удалить» вызывает onDelete', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<ProductCard product={product} onAdd={vi.fn()} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: /удалить/i }));

    expect(onDelete).toHaveBeenCalledWith(product);
  });

  test('«Товар недели» показывается только у выделенной карточки', () => {
    const { rerender } = render(<ProductCard product={product} onAdd={vi.fn()} />);
    expect(screen.queryByText('Товар недели')).not.toBeInTheDocument();

    rerender(<ProductCard product={product} onAdd={vi.fn()} featured />);
    expect(screen.getByText('Товар недели')).toBeInTheDocument();
  });
});
