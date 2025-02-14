FROM mcr.microsoft.com/mssql/server:2019-latest

# Argumentos para configuração
ARG SA_PASSWORD
ENV SA_PASSWORD=${SA_PASSWORD}
ENV ACCEPT_EULA=Y
ENV MSSQL_PID=Express

# Configurações de segurança
ENV MSSQL_AGENT_ENABLED=true
ENV MSSQL_ENABLE_HADR=0

# Copiar scripts de inicialização
WORKDIR /usr/src/app
COPY ./init/ /docker-entrypoint-initdb.d/

# Criar diretório para scripts de inicialização
RUN mkdir -p /usr/src/app/init && \
    chmod +x /usr/src/app/init

# Script de inicialização
COPY ./entrypoint.sh /usr/src/app/
RUN chmod +x /usr/src/app/entrypoint.sh

# Expor porta padrão do SQL Server
EXPOSE 1433

# Health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=10 \
    CMD /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P ${SA_PASSWORD} -Q "SELECT 1" || exit 1

# Executar script de inicialização
CMD /bin/bash ./entrypoint.sh 