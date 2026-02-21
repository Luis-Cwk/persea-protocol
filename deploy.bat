@echo off
echo ========================================
echo PERSÉA Protocol - Setup y Deploy
echo ========================================
echo.

:: Verificar Foundry
where forge >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Foundry no esta instalado.
    echo.
    echo Ejecuta primero en PowerShell como Admin:
    echo   .\install-foundry.ps1
    echo.
    echo O manualmente:
    echo   irm https://raw.githubusercontent.com/foundry-rs/foundry/master/foundryup/install.ps1 ^| iex
    echo   foundryup
    echo.
    pause
    exit /b 1
)

echo [OK] Foundry instalado
forge --version
echo.

:: Ir a carpeta de contratos
cd contracts

:: Crear .env si no existe
if not exist .env (
    echo Creando .env desde .env.example...
    copy .env.example .env
    echo.
    echo [IMPORTANTE] Edita el archivo contracts\.env con tu private key:
    echo   PRIVATE_KEY=tu_clave_privada_sin_0x
    echo.
    echo Para obtener fondos de testnet, usa el faucet:
    echo   curl -X POST https://agents.devnads.com/v1/faucet -H "Content-Type: application/json" -d "{\"chainId\": 10143, \"address\": \"TU_ADDRESS\"}"
    echo.
    pause
    exit /b 0
)

:: Instalar dependencias
echo Instalando dependencias...
forge install OpenZeppelin/openzeppelin-contracts --no-commit 2>nul || echo "OpenZeppelin ya instalado"
forge install foundry-rs/forge-std --no-commit 2>nul || echo "forge-std ya instalado"
echo.

:: Compilar
echo Compilando contratos...
forge build
if %errorlevel% neq 0 (
    echo [ERROR] Error compilando
    pause
    exit /b 1
)
echo [OK] Contratos compilados
echo.

:: Tests
echo Ejecutando tests...
forge test
echo.

:: Deploy
echo ========================================
echo Listo para desplegar en Monad Testnet
echo ========================================
echo.
echo Ejecuta para desplegar:
echo   forge script script/Deploy.s.sol:DeployScript --rpc-url https://testnet-rpc.monad.xyz --private-key %%PRIVATE_KEY%% --broadcast
echo.
pause
