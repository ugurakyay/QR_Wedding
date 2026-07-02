# Docker

## Çalıştırma

1. Kök dizinde `.env` dosyasını oluşturun (`.env.example` şablonu):
   ```bash
   cp .env.example .env
   # AWS ve ADMIN_PASSWORD değerlerini doldurun
   ```

2. Image oluşturup başlatın:
   ```bash
   docker compose up --build
   ```

   Uygulama `http://localhost:3001` adresinde çalışır.  
   Client ve API aynı portta sunulur — production'da CORS kapalıdır.

3. Arkaplanda çalıştırmak için:
   ```bash
   docker compose up -d --build
   ```

4. Durdurmak için:
   ```bash
   docker compose down
   ```

## Port

`PORT` env değişkeniyle varsayılan port (`3001`) değiştirilebilir:

```bash
PORT=8080 docker compose up
```