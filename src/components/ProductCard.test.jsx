import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from './ProductCard';
import { renderWithProviders } from '../test/utils';
import { products } from '../test/handlers';

const honey = products[0]; // { id: 1, name: 'Мёд гречишный', category: 'Мёд', price: '3500.00', unit: 'л' }

describe('ProductCard', () => {
  test('показывает название, цену и категорию', () => {
    renderWithProviders(<ProductCard product={honey} onAdd={vi.fn()} />);

    expect(screen.getByText('Мёд гречишный')).toBeInTheDocument();
    expect(screen.getByText('3500 тг / л')).toBeInTheDocument();
    expect(screen.getByText('Мёд')).toBeInTheDocument();
  });

  test('название - ссылка на страницу товара', () => {
    renderWithProviders(<ProductCard product={honey} onAdd={vi.fn()} />);

    expect(screen.getByRole('link', { name: /мёд гречишный/i })).toHaveAttribute('href', '/products/1');
  });

  test('кнопка «В корзину» вызывает onAdd с товаром', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn(); // «шпион»: запоминает, как его вызвали
    renderWithProviders(<ProductCard product={honey} onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: /в корзину/i }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(honey);
  });

  test('без onDelete (покупатель) кнопки «Удалить» нет', () => {
    renderWithProviders(<ProductCard product={honey} onAdd={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /удалить/i })).not.toBeInTheDocument();
  });

  test('у админа кнопка «Удалить» вызывает onDelete', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderWithProviders(<ProductCard product={honey} onAdd={vi.fn()} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: /удалить/i }));

    expect(onDelete).toHaveBeenCalledWith(honey);
  });
});
