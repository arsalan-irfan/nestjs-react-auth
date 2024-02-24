import ProfileCard from '../components/ProfileCard';
import Header from '../components/Header';

const Home = () => {
  return (
    <>
      <Header />
      <ProfileCard name="Test User" email="hello@test.com" />
    </>
  );
};

export default Home;
