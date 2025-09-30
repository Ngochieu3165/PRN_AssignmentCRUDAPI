# Ecommerce Frontend

A product management application built with Next.js that can be exported as a static website for hosting on Azure Storage Account.

## Features

- View product list
- Add new products
- Edit product information
- Delete products
- Responsive design
- Static export for storage account hosting

## Installation

```bash
npm install
```

## Run Development

```bash
npm run dev
```

## Build and Export Static

```bash
npm run build
```

After building, the `out` directory will contain static files ready to upload to storage account.

## API Configuration

Update the API URL in `.env.local` file:

```
NEXT_PUBLIC_API_URL=https://as-ecommerce-prn.azurewebsites.net/api
```

## Deploy to Azure Storage Account

### Method 1: Using Azure CLI

1. Build project:
```bash
npm run build
```

2. Login to Azure:
```bash
az login
```

3. Create storage account (if not exists):
```bash
az storage account create --name <storage-account-name> --resource-group <resource-group-name> --location <location> --sku Standard_LRS --kind StorageV2
```

4. Enable static website hosting:
```bash
az storage blob service-properties update --account-name <storage-account-name> --static-website --404-document 404.html --index-document index.html
```

5. Upload files to $web container:
```bash
az storage blob upload-batch --account-name <storage-account-name> --auth-mode key --source ./out --destination '$web' --overwrite
```

6. Get the static website URL:
```bash
az storage account show --name <storage-account-name> --resource-group <resource-group-name> --query "primaryEndpoints.web" --output tsv
```

### Method 2: Manual Upload

1. Build project: `npm run build`
2. Upload all contents of `out` directory to storage account
3. Enable static website hosting on storage account
4. Set index document to `index.html`

## Project Structure

- `app/` - Next.js app router
- `components/` - React components
- `lib/` - API utilities
- `types/` - TypeScript type definitions
- `out/` - Static export output (after build)