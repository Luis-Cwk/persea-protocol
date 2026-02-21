# Instalar Foundry en Windows
# Ejecutar en PowerShell como Administrador

Write-Host "Instalando Foundry..." -ForegroundColor Green

# Descargar e instalar foundryup
$foundryDir = "$env:USERPROFILE\.foundry"
if (-not (Test-Path $foundryDir)) {
    New-Item -ItemType Directory -Path $foundryDir | Out-Null
}

# Descargar foundryup
$foundryupUrl = "https://raw.githubusercontent.com/foundry-rs/foundry/master/foundryup/install.ps1"
$foundryupScript = Join-Path $foundryDir "install.ps1"

try {
    Invoke-WebRequest -Uri $foundryupUrl -OutFile $foundryupScript
    Write-Host "Descargando instalador..." -ForegroundColor Yellow
    
    # Ejecutar instalador
    & $foundryupScript
    
    # Agregar al PATH
    $binPath = Join-Path $foundryDir "bin"
    $env:Path += ";$binPath"
    
    # Agregar permanentemente al PATH del usuario
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($userPath -notlike "*$binPath*") {
        [Environment]::SetEnvironmentVariable("Path", "$userPath;$binPath", "User")
    }
    
    Write-Host "Foundry instalado correctamente!" -ForegroundColor Green
    Write-Host "Cierra esta terminal y abre una nueva para usar 'forge'" -ForegroundColor Yellow
    
} catch {
    Write-Host "Error instalando Foundry: $_" -ForegroundColor Red
    Write-Host "Intenta manualmente:" -ForegroundColor Yellow
    Write-Host "  irm https://raw.githubusercontent.com/foundry-rs/foundry/master/foundryup/install.ps1 | iex"
    Write-Host "  foundryup"
}
