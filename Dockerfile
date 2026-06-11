FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY KardexAPI/KardexAPI.csproj KardexAPI/
RUN dotnet restore KardexAPI/KardexAPI.csproj

COPY KardexAPI/ KardexAPI/

# Copia el cliente nativo Db2 desde NuGet
RUN mkdir -p /app/clidriver && \
    cp -R $(find /root/.nuget/packages -type d -name clidriver | head -n 1)/* /app/clidriver/

RUN dotnet publish KardexAPI/KardexAPI.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Dependencias necesarias para IBM Db2 native client
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libxml2 \
    libstdc++6 \
    libgcc-s1 \
    && (apt-get install -y --no-install-recommends libaio1 || apt-get install -y --no-install-recommends libaio1t64) \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .
COPY --from=build /app/clidriver /app/clidriver

ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENV IBM_DB_HOME=/app/clidriver
ENV LD_LIBRARY_PATH=/app/clidriver/lib:/app/clidriver/lib/icc
ENV PATH=/app/clidriver/bin:$PATH

EXPOSE 8080

ENTRYPOINT ["dotnet", "KardexAPI.dll"]