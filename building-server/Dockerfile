FROM ubuntu:focal as base

RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get upgrade -y
RUN apt-get install -y nodejs

RUN apt-get install git -y

WORKDIR /home/build/

FROM base as build
COPY package*.json .
COPY tsconfig.json .

RUN npm install 

COPY main.sh .
COPY src/ src/

RUN npm run build

FROM base as runner
WORKDIR /home/app

COPY --from=build /home/build/dist ./dist
COPY --from=build /home/build/main.sh main.sh
COPY --from=build /home/build/package*.json .

RUN chmod +x main.sh
RUN chmod +x dist/script.js

RUN npm install --omit=dev

ENV GIT_REPO_URL=https://github.com/Sourav-Goyal19/Notes

ENTRYPOINT [ "/home/app/main.sh" ]