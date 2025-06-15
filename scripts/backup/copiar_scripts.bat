@echo off
setlocal enabledelayedexpansion

echo ====================================
echo Copiando Scripts de Backup Supabase
echo ====================================

REM Define o diretório atual como origem
set "ORIGEM=%~dp0"

REM Solicita ao usuário o diretório de destino
set /p DESTINO="Digite o caminho completo da pasta de destino: "

REM Verifica se o diretório de destino existe, senão cria
if not exist "%DESTINO%" (
    mkdir "%DESTINO%"
    echo Diretório criado: %DESTINO%
)

REM Copia todos os arquivos SQL e o README
echo.
echo Copiando arquivos...
copy "%ORIGEM%\list_schema.sql" "%DESTINO%\" /Y
echo - list_schema.sql copiado
copy "%ORIGEM%\export_data.sql" "%DESTINO%\" /Y
echo - export_data.sql copiado
copy "%ORIGEM%\create_template.sql" "%DESTINO%\" /Y
echo - create_template.sql copiado
copy "%ORIGEM%\README.md" "%DESTINO%\" /Y
echo - README.md copiado

echo.
echo Cópia concluída com sucesso!
echo Os arquivos estão disponíveis em: %DESTINO%
echo.

pause 