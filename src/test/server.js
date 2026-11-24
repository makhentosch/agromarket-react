import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// MSW перехватывает fetch на уровне сети и отвечает вместо API
export const server = setupServer(...handlers);
