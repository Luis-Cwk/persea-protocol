# PERSÉA Protocol

**Trazabilidad y Aprovechamiento de Residuos del Aguacate en Blockchain**

Construido sobre Nomad Blockchain | Michoacán, México

## 🥑 Descripción

PERSÉA Protocol es una plataforma descentralizada que digitaliza la trazabilidad y el aprovechamiento de todos los residuos del aguacate michoacano: hueso, cáscara, pulpa descartada y biomasa de poda.

### El Problema
- 870,000 ton/año de residuos de aguacate en Michoacán sin registro, sin precio y sin mercado
- Valor económico potencial de USD 320M/año no capturado
- Sin sistema que mida, certifique y conecte residuos con compradores

### La Solución
- Tokenización de lotes de residuos en NFTs verificables (Batch NFTs)
- Trazabilidad inmutable en Nomad Blockchain
- Marketplace directo productor-comprador (PitMarket)
- Sistema de reputación y créditos de carbono (SeedScore)

## 📁 Estructura del Proyecto

```
Persea-Protocol/
├── contracts/          # Smart Contracts (Foundry + Solidity)
│   ├── src/
│   │   ├── SkinTraceContract.sol   # Batch NFTs ERC-721
│   │   ├── PitMarketContract.sol   # Marketplace con escrow
│   │   ├── SeedScoreContract.sol   # Reputación y carbon credits
│   │   ├── SeedConsentContract.sol # Consentimiento de datos
│   │   └── PerseaToken.sol         # Token de gobernanza
│   ├── script/
│   │   └── Deploy.s.sol
│   └── test/
│       └── Persea.t.sol
├── backend/            # API REST (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── models/
│   └── package.json
├── frontend/           # Web App (Next.js 14 + Tailwind + RainbowKit)
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── package.json
├── mobile/             # App Móvil (React Native + Expo)
│   ├── app/
│   ├── store/
│   └── package.json
└── ml/                 # Clasificador IA (Python + FastAPI + YOLOv8)
    ├── app/
    ├── models/
    └── pyproject.toml
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- Foundry (para contratos)
- Python 3.10+ (para ML)
- Docker (opcional)

### 1. Smart Contracts

```bash
cd contracts

# Instalar dependencias
forge install

# Compilar
forge build

# Tests
forge test

# Desplegar en testnet Nomad
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### 2. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar entorno
cp .env.example .env

# Desarrollo
npm run dev

# Producción
npm run build && npm start
```

### 3. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar entorno
cp .env.example .env.local

# Desarrollo
npm run dev

# Producción
npm run build && npm start
```

### 4. App Móvil

```bash
cd mobile

# Instalar dependencias
npm install

# Iniciar Expo
npx expo start

# Build
npx expo build:android
npx expo build:ios
```

### 5. Servicio ML

```bash
cd ml

# Crear entorno virtual
python -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -e .

# Iniciar servidor
python run.py
```

## 🔗 Contratos Desplegados

### Monad Testnet (Chain ID: 10143)

| Contrato | Dirección |
|----------|-----------|
| SkinTraceContract | `0x...` |
| PitMarketContract | `0x...` |
| SeedScoreContract | `0x...` |
| SeedConsentContract | `0x...` |
| PerseaToken | `0x...` |

## 📊 API Endpoints

### Batches
- `POST /batches/register` - Registrar nuevo lote
- `GET /batches` - Listar lotes
- `GET /batches/:tokenId` - Obtener lote
- `POST /batches/:tokenId/transfer` - Transferir custodia

### Mercado
- `POST /market` - Crear listing
- `GET /market` - Listar listings
- `POST /market/offer` - Hacer oferta
- `POST /market/:id/accept/:offerIndex` - Aceptar oferta
- `POST /market/confirm-delivery` - Confirmar entrega

### Usuario
- `GET /users/profile/:address` - Perfil de usuario
- `GET /users/:address/green-score` - Green Score
- `POST /users/consent` - Actualizar consentimiento

### Datos
- `GET /data/aggregated` - Datos agregados
- `GET /data/prices` - Precios de mercado

## 🌿 Tipos de Residuos

| Tipo | Ton/año | Compuestos de Valor | Mercados |
|------|---------|---------------------|----------|
| 🟤 Semilla/Hueso | ~340,000 | Almidón, aceite, polifenoles | Cosmética, bioplásticos, farmacéutica |
| 🟢 Cáscara | ~270,000 | Celulosa, lignina, extractos | Compost, colorantes, biopolímeros |
| 🟡 Pulpa | ~140,000 | Ácido oleico, vitamina E | Aceite premium, cosmética gourmet |
| 🌿 Biomasa | ~120,000 | Aceites esenciales, flavonoides | Biochar, carbon credits |

## 🗓️ Roadmap

### Fase 0: Cimientos (Mar-Abr 2026)
- Smart contracts en testnet Nomad
- App móvil prototipo
- Acuerdos con cooperativas de Tancítaro

### Fase 1: MVP (May-Ago 2026)
- App iOS y Android funcional
- WasteClassifier IA >80% accuracy
- 100 productores registrados

### Fase 2: Mainnet + Mercado (Sep 2026-Feb 2027)
- Mainnet Nomad activo
- PitMarket operando
- 500 usuarios activos

### Fase 3: Expansión (Mar 2027-Feb 2028)
- Token PERSEA en DEX
- API SeedData
- 3,000 usuarios

### Fase 4: Ecosistema (Mar 2028-Feb 2029)
- DAO activa
- Expansión a Jalisco
- 10,000 usuarios

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuir

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📧 Contacto

- Email: contacto@perseaprotocol.io
- Twitter: @perseaprotocol
- GitHub: github.com/persea-protocol

---

**PERSÉA Protocol** - Del árbol al dato, trazado en cadena. 🥑
