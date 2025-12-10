# Build React
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Build .NET with database
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src

# Copy .NET project file first
COPY backend/*.csproj ./backend/
WORKDIR /src/backend
RUN dotnet restore

# Copy the rest of .NET code
COPY backend/ .

# Copy React build to wwwroot
COPY --from=frontend-build /app/frontend/build ./wwwroot

# Publish .NET
RUN dotnet publish -c Release -o /app/publish

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Copy published .NET app
COPY --from=backend-build /app/publish .

# Copy database
COPY bookstore.db /app/

# IMPORTANT: Copy React files to wwwroot inside container
COPY --from=frontend-build /app/frontend/build /app/wwwroot

# Railway uses PORT environment variable
ENV ASPNETCORE_URLS=http://*:${PORT:-8080}
EXPOSE ${PORT:-8080}

ENTRYPOINT ["dotnet", "backend.dll"]