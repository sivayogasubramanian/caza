<p align="center"><img src="public/apple-splash-1334-750.jpg" width="50%"/></p>

<h1 align="center">Caza</h1>

<p align="center">
<img src="https://github.com/sivayogasubramanian/caza/actions/workflows/ci.yml/badge.svg" />
</p>

<h3 align="center"><a href='Get started here!'>Get started here!</a></h3>

<br/>

## Overview

University students have a lot on their plate, and for those who aspire to break into software engineering, the internship season can be quite the headache. Caza reduces their burden by helping students track their internship applications.

Caza is an internship or job application tracker for Computer Science (CS) students. It allows users to track the progress of the applications, note down tasks, and access global statistics of application statuses for various job roles.

## Team Members

This progressive web app is made as a assignment 3 project in CS3216. Made with ❤️ by:

| Member                                           | Role                   |
| ------------------------------------------------ | ---------------------- |
| Bharath Chandra Sudheer (A0218550J)              | Full-stack, Firebase   |
| Gan Hong Yao (A0217912H)                         | Full-stack, Database   |
| Han Geng Ning (A0222055U)                        | Full-stack, UI         |
| Ruppa Nagarajan Sivayoga Subramanian (A0217379U) | Full-stack, Deployment |

## Getting started with local development

1. Install nvm by following the instructions [here](https://github.com/nvm-sh/nvm#install--update-script).
1. Then, install the node version in `.nvmrc` by running `nvm install <VERSION>`.
1. Install yarn by following the instructions [here](https://classic.yarnpkg.com/en/docs/install).
1. Make a copy of `.env.example` as `.env` file in the root directory of the project.
1. Create a firebase project and enable the following services:
   - Authentication (Anonymous and Github OAuth)
1. Add the firebase enviroment variables.
1. Setup Postgresql database and add the database credentials to the `.env` file.
1. Run `yarn install` to install all the dependencies.
1. Run `yarn prisma migrate dev` to migrate the database.
1. Run `yarn dev` to start the development server.
1. Navigate to `http://localhost:3000/` to view the app. Happy Hacking! 😃
