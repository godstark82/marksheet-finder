# Marksheet Finder Application

A web application to check if a student's marksheet is available based on data from a Google Sheets spreadsheet.

## Features

- Search for marksheet availability by roll number
- Displays student name and marksheet status
- Bilingual interface (English and Hindi)
- Responsive design for all devices

## Setup Instructions

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up Google Sheets:
   - Create a Google Sheets document with the following format:
     - Column A: Roll Numbers
     - Column B: Student Names
     - Column C: Marksheet Availability (yes/no/true/false/1/0)
   - Make sure your service account has access to the sheet (Share the Google Sheet with the service account email)

4. Configure environment variables:
   - Rename `.env.local.example` to `.env.local`
   - Add your Google Sheet ID to the `.env.local` file
   - Add your Google Cloud service account credentials to the `.env.local` file
     (You can copy the values from your service account JSON file)

5. Run the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## Service Account Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"
4. Create a service account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Enter a name and description for the service account
   - Click "Done"
5. Create a key for the service account:
   - Click on the service account you just created
   - Go to the "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON" and click "Create"
   - The key file will be downloaded to your computer
6. Share your Google Sheet with the service account email address (it looks like: `service-account-name@project-id.iam.gserviceaccount.com`)

## Google Sheets Setup

Your Google Sheets should have the following structure:

| Roll Number | Student Name | Marksheet Available |
|-------------|--------------|---------------------|
| 12345       | John Doe     | Yes                 |
| 67890       | Jane Smith   | No                  |

## Deployment

This application can be easily deployed on Vercel or any other Next.js compatible hosting service.

## License

MIT
