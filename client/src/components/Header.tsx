import Logo from '../assets/secure-logo.png';
export default function Header() {
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
          <a href="#" className="text-md font-semibold leading-6 text-gray-900">
            Log out <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
