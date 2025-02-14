#!/bin/bash

# Iniciar SQL Server
/opt/mssql/bin/sqlservr &

# Aguardar SQL Server iniciar
echo "Aguardando SQL Server iniciar..."
sleep 30s

# Executar scripts de inicialização
for i in {1..50};
do
    # Executar script de criação do banco
    /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $SA_PASSWORD -d master -i /usr/src/app/init/01-schema.sql
    if [ $? -eq 0 ]
    then
        echo "Schema criado com sucesso"
        break
    else
        echo "Não foi possível conectar. Tentativa $i..."
        sleep 1
    fi
done

# Manter container rodando
tail -f /dev/null 