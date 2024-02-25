## Nest React Authentication App 🔑🔒

### Overview

This is a full stack application which provides a detailed demonstration of the email/password authentication. The server is developed using Nestjs and the client is made on React and Typescript. The application has variety of features implemented to ensure secure and efficient authentication.

### Tech Stack Used:

- Backend Framework: **NestJSv10**
- Frontend Framework: **React v18 + Typescript + Vite**
- Database: **MongoDB**
- ORM: **Mongoose**
- Package Manager: **Yarn**

### Steps to run the project:

Use the below repo url to clone, once the repo is clone navigate to the folder

```sh
git clone https://github.com/arsalan-irfan/nestjs-react-auth

cd nestjs-react-auth
```

#### 1: Installation of the Required Tools :

- [mongodb](https://www.mongodb.com/docs/manual/installation/)
- [nodejs](https://nodejs.org)

#### 2: Setup env files

Go to the Server folder

Copy `sample.env` to new file `.env.dev` and `.env.test`

```sh
cd ./client
cp sample.env .env.dev
cp sample.env .env.test
```

#### 3: Build and run `Client`

Open a new terminal and execute the following commands:

```sh
cd client
yarn install
yarn dev
```

#### 4: Build and run `Server`

Open up another terminal and run the following commands:

```sh
cd server
yarn install
yarn start:dev
```

#### To run tests on backend

```sh
yarn test
yarn test:watch //in watch mode
```
