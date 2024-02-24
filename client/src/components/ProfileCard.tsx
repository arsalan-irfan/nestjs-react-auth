import React from 'react';

interface IProfileCard {
  email: string;
  name: string;
}

const ProfileCard: React.FC<IProfileCard> = ({ name, email }) => {
  return (
    <div className="mt-10 pt-5 h-[300px] flex flex-wrap justify-center  ">
      <div className="container lg:w-2/6 xl:w-2/7 sm:w-full md:w-2/3 bg-white shadow-lg transform ">
        <div className="flex justify-center px-5 mb-4">
          {/* <img
            className="h-32 w-32 bg-white p-2 rounded-full   "
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
            alt=""
          /> */}
          <h1 className="text-4xl text-indigo-600 font-bold">Welcome 👋</h1>
        </div>
        <div className="mt-2">
          <div className="text-center px-14">
            <h2 className="text-gray-800 text-3xl font-bold">{name}</h2>
            <div className="mt-2"></div>
            <h3 className="text-gray-500">
              <span className="font-bold">Email: </span>
              {email}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
