# Open Clinical Record API — multi-stage image (ASP.NET Core 8)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY OpenClinicalRecord.Api.csproj ./
RUN dotnet restore OpenClinicalRecord.Api.csproj

COPY . ./
RUN dotnet publish OpenClinicalRecord.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "OpenClinicalRecord.Api.dll"]
