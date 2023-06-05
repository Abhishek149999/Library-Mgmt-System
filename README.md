# Library Management System

This is a library management system built with NestJS and TypeORM, with test cases using Jest.

## Description

The Library Management System is a web application designed to manage the operations and functionalities of a library. It provides features such as book borrowing, book return, book search, and library inventory management.

## Features
- Get Books: Users can fetch all available books in the library.
- Book borrowing: Users can borrow books from the library with certain conditions.
- Book return: Users can return borrowed books to the library.

## Technologies Used

- [NestJS](https://nestjs.com/): A progressive Node.js framework for building efficient and scalable server-side applications.
- [TypeORM](https://typeorm.io/): An ORM (Object-Relational Mapping) library for TypeScript and JavaScript.
- [Jest](https://jestjs.io/): A JavaScript testing framework for writing unit tests.
- [MySQL](https://www.mysql.com/): A popular open-source relational database management system.

## Installation

1. Clone the repository:

   ```bash
   git clone <repository_url>

2. Install the packages
    yarn

3. Make sure add the required config for connecting with DB by creating .env file
   You can find the example of env in env.test file along with the keys.

4. To start application user
    nest start

5. To run the test cases use
    npm test

## Tips

You may find the postman collection in this repo to executing the APIs.
