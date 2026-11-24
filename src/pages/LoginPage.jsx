import { Navigate, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="page page--narrow">
      <AuthForm
        mode="login"
        onSuccess={(data) => {
          login(data);
          navigate('/');
        }}
      />
    </main>
  );
}

export default LoginPage;
