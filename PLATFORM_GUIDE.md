# PERSÉA Platform - Guía Completa

## 🥑 ¿Qué es PERSÉA?

PERSÉA es una plataforma descentralizada para la trazabilidad y comercialización de residuos del aguacate en la blockchain Monad.

### Problema que resuelve:
- **870,000 toneladas/año** de residuos de aguacate en Michoacán sin mercado formal
- **$320M USD/año** de valor económico no capturado
- Sin trazabilidad ni certificación de residuos

### Solución:
- **Batch NFTs**: Cada lote de residuos es un NFT con metadatos inmutables
- **Marketplace P2P**: Conexión directa productor-comprador
- **Green Score**: Sistema de reputación ambiental
- **Créditos de Carbono**: Tokenización de impacto ambiental positivo

---

## 🚀 Despliegue Completado

### Contratos en Monad Testnet (Chain ID: 10143)

| Contrato | Address |
|----------|---------|
| PerseaToken | `0x58fe512A24A5d3160a8B161C64623f40d4bD113d` |
| SkinTraceContract | `0x1Deed2c283b950439E1AfE726AEb7Ee257E6aa41` |
| PitMarketContract | `0x1d6975d2C0e466928b7dEB47fe48fAD3624A983B` |
| SeedScoreContract | `0x946Ed93acCaF382617409F03938537fC41454B7B` |
| SeedConsentContract | `0xA541032b1A9BcA068a72E4da7F3ff0A07c9F18D9` |

### Frontend Desplegado

```
https://frontend-1isim5d1g-dfrmnc22-2731s-projects.vercel.app
```

---

## ✅ Pruebas Completadas

### 1. Registro de Lotes (Batch NFTs)
| Batch | Tipo | Peso | Variedad | Estado |
|-------|------|------|----------|--------|
| 0 | Semilla/Hueso | 500 kg | Hass | Listado |
| 1 | Cáscara | 800 kg | Hass | Listado |
| 2 | Pulpa | 300 kg | Méndez | Listado |
| 3 | Biomasa | 1000 kg | Criollo | Transferido |

### 2. Marketplace (Listings)
| Listing | Batch | Precio/kg | Peso Total | Activo |
|---------|-------|-----------|------------|--------|
| 0 | Semilla | 0.01 MON | 500 kg | ✅ |
| 1 | Cáscara | 0.005 MON | 800 kg | ✅ |
| 2 | Pulpa | 0.008 MON | 300 kg | ✅ |

### 3. Floor Prices
| Tipo | Precio Mínimo |
|------|---------------|
| Semilla | 0.005 MON/kg |
| Cáscara | 0.001 MON/kg |
| Pulpa | 0.003 MON/kg |
| Biomasa | 0 MON/kg |

### 4. Transferencia de Custodia
- Batch #3 transferido a: `0xfe05914BdFAD80734D55b91015Dd09c6dA0Ae5fB`

---

## 📱 Cómo Usar la Plataforma

### Paso 1: Configurar Wallet
1. Instalar MetaMask
2. Agregar red Monad Testnet:
   - Network Name: `Monad Testnet`
   - RPC URL: `https://testnet-rpc.monad.xyz`
   - Chain ID: `10143`
   - Currency: `MON`
   - Explorer: `https://testnet.monadscan.com`

### Paso 2: Obtener MON
- Visitar: https://faucet.monad.xyz
- Solicitar MON gratis para pruebas

### Paso 3: Conectar en la App
1. Ir al frontend
2. Click en "Connect Wallet"
3. Seleccionar MetaMask
4. Confirmar conexión

### Paso 4: Usar la Plataforma
- **Registrar Lote**: Crear nuevo Batch NFT
- **Ver Mercado**: Explorar listings disponibles
- **Dashboard**: Ver tu Green Score y estadísticas

---

## 🔐 Wallets de Prueba

### Admin/Deployer
```
Address: 0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A
Rol: Admin, Producer, Verifier, Verified Buyer
PERSEA Balance: 100,000,000 tokens
``` 

### Test Buyer
```
Address: 0xfe05914BdFAD80734D55b91015Dd09c6dA0Ae5fB
Rol: Verified Buyer
Batch Recibido: #3 (Biomass, 1000 kg)
```

---

## 📊 Estadísticas

- **Contratos Desplegados**: 5
- **Batches Registrados**: 4
- **Listings Activos**: 3
- **Transacciones Exitosas**: 15+
- **Gas Usado**: ~4.2 MON

---

## 🔗 Enlaces Útiles

- **Frontend**: https://frontend-1isim5d1g-dfrmnc22-2731s-projects.vercel.app
- **Explorer**: https://monad-testnet.socialscan.io
- **Faucet**: https://faucet.monad.xyz

---

## 🎯 Próximos Pasos

1. ✅ Contratos desplegados y probados
2. ✅ Frontend funcionando
3. ⏳ Backend API (desplegar en Railway/Render)
4. ⏳ Integración IPFS para fotos
5. ⏳ App móvil (React Native)

---

## 💡 Funcionalidades del Marketplace

### Para Productores:
- Registrar lotes de residuos como NFTs
- Crear listings con precio
- Transferir custodia a compradores
- Acumular Green Score

### Para Compradores:
- Explorar listings por tipo de residuo
- Hacer ofertas de compra
- Confirmar entrega
- Obtener trazabilidad completa

### Floor Prices:
- Protegen a productores de precios muy bajos
- Cada tipo de residuo tiene un mínimo
- Configurables por el admin

### Comisiones:
- 1.5% sobre cada transacción
- Paga el vendedor al completar venta
- Acumula en treasury del protocolo

---

**PERSÉA Platform** - Del árbol al dato, trazado en cadena. 🥑
