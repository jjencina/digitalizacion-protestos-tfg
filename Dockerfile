FROM node:20

WORKDIR /usr/src/app

# Instalar MySQL 
RUN apt-get update && apt-get install -y default-mysql-client wget

# Instalar Cloud SQL Proxy
RUN wget https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.1/cloud-sql-proxy.linux.amd64 -O /usr/local/bin/cloud-sql-proxy
RUN chmod +x /usr/local/bin/cloud-sql-proxy

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "app.js"]