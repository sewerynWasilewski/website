FROM node:24.9.0 AS build

ARG BUILD_COMMIT=dev
ARG BUILD_DATE=unknown

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g @angular/cli

COPY . .

RUN ng build --configuration=production

RUN echo "{\"commit\":\"${BUILD_COMMIT}\",\"date\":\"${BUILD_DATE}\"}" \
    > /app/dist/website/browser/version.json

FROM nginx:latest

COPY --from=build /app/dist/website/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
