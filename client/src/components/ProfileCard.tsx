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
