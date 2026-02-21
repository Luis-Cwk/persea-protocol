# Instalar Foundry en Windows

## Opción 1: Usar WSL (Recomendado)

### Paso 1: Instalar WSL
Abre **PowerShell como Administrador** y ejecuta:

```powershell
wsl --install
```

Esto instalará Ubuntu. **Reinicia tu computadora** cuando termine.

### Paso 2: Abrir Ubuntu
Después de reiniciar, abre "Ubuntu" desde el menú inicio.
- Crea un usuario y contraseña cuando te lo pida

### Paso 3: Instalar Foundry en Ubuntu/WSL
En la terminal de Ubuntu:

```bash
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup
```

### Paso 4: Verificar
```bash
forge --version
cast --version
```

### Paso 5: Ir a tu proyecto
```bash
cd /mnt/c/Users/petra/Documents/Persea-Protocol/contracts
```

---

## Opción 2: Usar Git Bash

Si ya tienes Git instalado:

### Paso 1: Abrir Git Bash
Busca "Git Bash" en el menú inicio

### Paso 2: Instalar
```bash
curl -L https://foundry.paradigm.xyz | bash
```

### Paso 3: Recargar
Cierra y abre Git Bash de nuevo

### Paso 4: Instalar Foundry
```bash
foundryup
```

---

## Después de instalar

### Crear wallet
```bash
cast wallet new
```

### Guardar la private key (sin 0x)
Añade a `contracts/.env`:
```
PRIVATE_KEY=tu_private_key_aqui
```

### Obtener fondos del faucet
```bash
curl -X POST https://agents.devnads.com/v1/faucet \
  -H "Content-Type: application/json" \
  -d '{"chainId": 10143, "address": "TU_ADDRESS"}'
```

### Compilar y desplegar
```bash
cd /mnt/c/Users/petra/Documents/Persea-Protocol/contracts
forge install
forge build
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY \
  --broadcast
```
