# Script PowerShell para criar um dump do banco de dados Supabase
# Este script guia o usuário para criar um dump do banco Supabase usando pg_dump

# Função para verificar se o pg_dump está instalado
function Test-PgDump {
    try {
        $null = & pg_dump --version
        return $true
    }
    catch {
        return $false
    }
}

# Criar pasta de backup se não existir
$backupDir = Join-Path $PSScriptRoot "backup"
if (-not (Test-Path $backupDir)) {
    New-Item -Path $backupDir -ItemType Directory | Out-Null
    Write-Host "Pasta de backup criada: $backupDir" -ForegroundColor Green
}

# Verificar se pg_dump está instalado
if (-not (Test-PgDump)) {
    Write-Host "ERRO: pg_dump não encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale o PostgreSQL Client Tools:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "2. Baixe e instale o PostgreSQL" -ForegroundColor Yellow
    Write-Host "3. Certifique-se de que o caminho de instalação está no PATH do sistema" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n=== Assistente de Backup do Banco de Dados Supabase ===" -ForegroundColor Cyan
Write-Host "Este script vai ajudá-lo a criar um dump do seu banco de dados Supabase.`n" -ForegroundColor Cyan

Write-Host "Para obter as informações de conexão necessárias:" -ForegroundColor Yellow
Write-Host "1. Acesse o console do Supabase: https://app.supabase.com" -ForegroundColor Yellow
Write-Host "2. Selecione seu projeto" -ForegroundColor Yellow
Write-Host "3. Vá para Configurações > Database" -ForegroundColor Yellow
Write-Host "4. Copie as informações de conexão (Connection Pool ou Connection String)`n" -ForegroundColor Yellow

# Definir os valores padrão do novo Supabase
$default_host = "db.zwtnjjehmuhnxftrjmvm.supabase.co"
$default_port = "5432"
$default_database = "postgres"
$default_user = "postgres"

# Solicitar informações de conexão do usuário com os novos valores pré-sugeridos
$host_prompt = "Host do banco de dados (pressione Enter para usar $default_host)"
$host_input = Read-Host $host_prompt
if ([string]::IsNullOrWhiteSpace($host_input)) { $host_input = $default_host }

$port_prompt = "Porta (pressione Enter para usar $default_port)"
$port_input = Read-Host $port_prompt
if ([string]::IsNullOrWhiteSpace($port_input)) { $port_input = $default_port }

$database_prompt = "Nome do banco de dados (pressione Enter para usar $default_database)"
$database_input = Read-Host $database_prompt
if ([string]::IsNullOrWhiteSpace($database_input)) { $database_input = $default_database }

$user_prompt = "Usuário do banco de dados (pressione Enter para usar $default_user)"
$user_input = Read-Host $user_prompt
if ([string]::IsNullOrWhiteSpace($user_input)) { $user_input = $default_user }

$password_input = Read-Host "Senha do banco de dados" -AsSecureString
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password_input))

# Criar nome de arquivo para o backup com timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = Join-Path $backupDir "supabase_backup_$timestamp.sql"

Write-Host "`nIniciando processo de backup..." -ForegroundColor Cyan

# Montar string de conexão
$connString = "host=$host_input port=$port_input dbname=$database_input user=$user_input password=$password"

# Executar pg_dump
try {
    # Construindo o comando pg_dump
    $pgDumpCmd = "pg_dump ""$connString"" -f ""$backupFile"" --clean --if-exists --schema=public,storage"
    
    # Executando pg_dump (usando Invoke-Expression para evitar problemas com senhas complexas)
    Write-Host "Executando pg_dump..." -ForegroundColor Yellow
    Invoke-Expression $pgDumpCmd
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nBackup concluído com sucesso!" -ForegroundColor Green
        Write-Host "Arquivo de backup salvo em: $backupFile" -ForegroundColor Green
        
        # Mostrar tamanho do arquivo
        $fileInfo = Get-Item $backupFile
        $fileSizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
        Write-Host "Tamanho do arquivo: $fileSizeMB MB" -ForegroundColor Green
    }
    else {
        Write-Host "`nErro ao executar pg_dump. Código de saída: $LASTEXITCODE" -ForegroundColor Red
    }
}
catch {
    Write-Host "`nErro ao executar o comando pg_dump:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`nAlternativamente, você pode baixar um backup da interface do Supabase:" -ForegroundColor Yellow
Write-Host "1. Acesse o console do Supabase: https://app.supabase.com/" -ForegroundColor Yellow
Write-Host "2. Navegue até seu projeto > Banco de dados > Backup diário" -ForegroundColor Yellow
Write-Host "3. Baixe o backup mais recente" -ForegroundColor Yellow

Write-Host "`nPressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 