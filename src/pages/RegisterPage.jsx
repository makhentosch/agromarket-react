import { Navigate, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="page page--narrow">
      <AuthForm
        mode="register"
        onSuccess={(data) => {
          login(data); // после регистрации сервер сразу выдаёт токен
          navigate('/');
        }}
      />
    </main>
  );
}

export default RegisterPage;
