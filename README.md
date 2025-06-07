# N16Fin Frontend

## Requirements
In a local enviroment:
- NodeJS 20 and NPM

## Installation

Clone the repository into a folder with the project name:
```shell
git clone https://github.com/toskabnk/N16Fin_Front.git
```
Or in the current folder with:
```shell
git clone https://github.com/toskabnk/N16Fin_Front.git .
```

Install the dependencies with

```shell
npm install
```
Rename `.env.example` to `.env` and edit the `VITE_API_URL` with the direction of the API.

## Run

Once the dependencies are installed, you can run the project in a local environment by executing the following command in a terminal:

```shell
npm run dev
```

Also, you can expose the proyect to your network by executing the following command in a terminal:
```shell
npm run host
```

## Compilation

To compile the project, run the following command in a terminal
```shell
npm run build
```
A 'dist' folder will be created in the root of the project. Inside, you will find the assets used, as well as the compiled HTML and JS code of the project.