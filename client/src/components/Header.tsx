import { useState } from 'react';
import Logo from '../assets/secure-logo.png';
import { authService } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

export default function Header() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const logoutUser = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      navigate('/');
      setLoading(false);
    } catch (error: any) {
      // if (error.statusCode === 403) {
      //   handleUnAuthorizedException();
      // }
    }
  };
  return (
    <header className="bg-white">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <img className="h-[50px] w-auto" src={Logo} alt="" />
          </a>
        </div>

        <div className=" lg:flex lg:flex-1 lg:justify-end">
          <Button
            width={500}
            variant="danger"
            onClick={logoutUser}
            disabled={loading}
          >
            Log out <span aria-hidden="true">&rarr;</span>
          </Button>
        </div>
      </nav>
    </header>
  );
}
