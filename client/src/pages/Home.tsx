import ProfileCard from '../components/ProfileCard';
import Header from '../components/Header';
import { MeResponse, authService } from '../services/AuthService';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MoonLoader } from 'react-spinners';

const Home = () => {
  const [user, setUser] = useState<null | MeResponse>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleUnAuthException = () => {
    toast('Your session has been expired!', {
      type: 'info',
    });
    navigate('/login');
  };

  const getCurrentUser = async () => {
    try {
      setLoading(true);
      const authenticatedUser = await authService.me();
      setUser(authenticatedUser);
    } catch (error: any) {
      if (error.statusCode === 403) {
        handleUnAuthException();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <>
      <Header />
      <div className="mt-10 pt-5 h-[300px] flex flex-wrap justify-center">
        {loading && <MoonLoader color="#4F46E5" />}
        {user && <ProfileCard name={user.name} email={user.email} />}
      </div>
    </>
  );
};

export default Home;
