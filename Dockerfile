FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY KardexAPI/KardexAPI.csproj KardexAPI/
RUN dotnet restore KardexAPI/KardexAPI.csproj

COPY KardexAPI/ KardexAPI/
RUN dotnet publish KardexAPI/KardexAPI.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "KardexAPI.dll"]