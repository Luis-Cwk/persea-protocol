# Guía de Despliegue en Monad Testnet

## Paso 1: Instalar Foundry

### Opción A: PowerShell (Recomendado)
```powershell
# Ejecutar como Administrador
irm https://raw.githubusercontent.com/foundry-rs/foundry/master/foundryup/install.ps1 | iex
foundryup
```

### Opción B: Usando el script incluido
```powershell
.\install-foundry.ps1
```

**Cierra y abre una nueva terminal** después de instalar.

## Paso 2: Crear Wallet y Obtener Fondos

### Generar nueva wallet:
```bash
cast wallet new
```

Guarda el address y private key en un lugar seguro.

### Obtener MON de testnet:
```bash
# Reemplaza TU_ADDRESS con tu dirección
curl -X POST https://agents.devnads.com/v1/faucet ^
  -H "Content-Type: application/json" ^
  -d "{\"chainId\": 10143, \"address\": \"TU_ADDRESS\"}"
```

O usa el faucet oficial: https://faucet.monad.xyz

## Paso 3: Configurar Variables de Entorno

Edita el archivo `contracts\.env`:

```env
PRIVATE_KEY=tu_private_key_sin_0x
MONADSCAN_API_KEY=tu_api_key_opcional
```

## Paso 4: Instalar Dependencias

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install foundry-rs/forge-std --no-commit
```

## Paso 5: Compilar

```bash
forge build
```

## Paso 6: Ejecutar Tests

```bash
forge test
```

## Paso 7: Desplegar

```bash
forge script script/Deploy.s.sol:DeployScript ^
  --rpc-url https://testnet-rpc.monad.xyz ^
  --private-key %PRIVATE_KEY% ^
  --broadcast
```

## Paso 8: Guardar Direcciones

Después del deploy, copia las direcciones de los contratos al archivo `.env` del backend:

```env
SKIN_TRACE_ADDRESS=0x...
PIT_MARKET_ADDRESS=0x...
SEED_SCORE_ADDRESS=0x...
SEED_CONSENT_ADDRESS=0x...
PERSEA_TOKEN_ADDRESS=0x...
```

## Verificar Contratos

```bash
# El skill de Monad tiene una API de verificación automática
# Ver monad-development/SKILL.md para más detalles
```

## Comandos Rápidos

```bash
# Todo en uno
.\deploy.bat

# Solo compilar
forge build

# Solo tests
forge test -vvv

# Deploy con verbose
forge script script/Deploy.s.sol:DeployScript --rpc-url https://testnet-rpc.monad.xyz --private-key %PRIVATE_KEY% --broadcast -vvv
```

## Exploradores

- Socialscan: https://monad-testnet.socialscan.io
- MonadVision: https://testnet.monadvision.com
- Monadscan: https://testnet.monadscan.com
