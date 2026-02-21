# Desplegar PERSÉA en Vercel

## Opción 1: Desde GitHub (Recomendado)

### Paso 1: Subir a GitHub
```bash
cd C:\Users\petra\Documents\Persea-Protocol
git init
git add .
git commit -m "Initial commit - PERSÉA Protocol"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/persea-protocol.git
git push -u origin main
```

### Paso 2: Conectar con Vercel
1. Ve a https://vercel.com
2. Inicia sesión con GitHub
3. Click en "Add New" → "Project"
4. Importa el repositorio `persea-protocol`
5. Configura:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Environment Variables** (añade estas):
     ```
     NEXT_PUBLIC_API_URL=https://persea-backend.tu-dominio.com
     NEXT_PUBLIC_CHAIN_ID=10143
     NEXT_PUBLIC_RPC_URL=https://testnet-rpc.monad.xyz
     NEXT_PUBLIC_SKIN_TRACE_ADDRESS=0xD4934103857Df1AF9d6760b37DF480f92aD952e9
     NEXT_PUBLIC_PIT_MARKET_ADDRESS=0xA8b6E9E1DB21Aa05A1BBD7e887926604058651C5
     NEXT_PUBLIC_SEED_SCORE_ADDRESS=0x3f173943211b524dd08bd68de462C26DB5F69578
     NEXT_PUBLIC_PERSEA_TOKEN_ADDRESS=0x27fe9ACA3c32E1df31a470b23f29E3Ce91F8ff04
     ```
6. Click en "Deploy"

---

## Opción 2: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Ir al proyecto
cd C:\Users\petra\Documents\Persea-Protocol\frontend

# Desplegar
vercel

# Seguir las instrucciones del CLI
```

---

## Para el Backend (API)

El backend necesita un servidor con Node.js. Opciones:

### Railway (Recomendado para backend)
1. Ve a https://railway.app
2. Conecta con GitHub
3. Despliega desde `backend/`
4. Añade las variables de entorno

### Render
1. Ve a https://render.com
2. Crea un nuevo Web Service
3. Conecta tu repo
4. Configura:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Root Directory: `backend`

---

## URLs finales

Después del despliegue tendrás:
- **Frontend**: `https://persea-protocol.vercel.app`
- **Backend**: `https://persea-backend.railway.app` (o similar)

Actualiza `NEXT_PUBLIC_API_URL` en Vercel con la URL del backend.
