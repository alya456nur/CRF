# Customer Request Form (CRF)

A web-based management system developed during my internship at Melaka Biotechnology Corporation (MBC), Melaka.

The Customer Request Form (CRF) is an internal business management application designed to streamline the management of customer information, laboratory sample registrations, testing requests, staff records, and financial transactions. The system provides a centralized platform for managing operational data and monitoring laboratory testing activities.

## Features

- **Dashboard** – Provides an overview of testing activities, sales, and income.
- **Company Management** – Add, view, update, and manage client company records.
- **Contact Management** – Maintain customer and company contact information.
- **Sample Management** – Register and manage laboratory samples.
- **Testing Management** – Register testing requests and monitor their progress, including pending, ongoing, completed, and cancelled requests.
- **Testing Parameter Management** – Manage internal and outsourced laboratory testing services, parameters, and pricing.
- **Invoice & Payment Management** – Manage testing charges, payment statuses, invoices, and proof of payment.
- **Purchase Order Management** – Upload and maintain purchase order records.
- **Staff Management** – Register staff accounts and manage departmental assignments.
- **Reports & Analytics** – View financial summaries and business statistics.
- **User Profile Management** – Manage staff account information.

## Technologies Used

| Category | Technologies |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Firebase Cloud Functions |
| Database | Firebase Cloud Firestore |
| Authentication | Firebase Authentication |
| File Storage | Firebase Cloud Storage |
| Hosting | Firebase Hosting |
| Runtime | Node.js |
| Libraries | Chart.js, jQuery, Select2, SheetJS |

## System Structure

The application consists of several interconnected modules:

- Customer and company information management
- Laboratory sample and testing management
- Internal and outsourced testing services
- Financial and payment management
- Staff and account management
- Dashboard and reporting

Firebase services are used to support data storage, user authentication, file uploads, and backend operations.

## Installation & Setup

This project uses Firebase services and requires a Firebase project for configuration.

1. Clone the repository:
   
   git clone https://github.com/alya456nur/CRF.git

3. Navigate to the project directory:

   cd CRF

4. Install the root dependencies:

   npm install

5. Install the Cloud Functions dependencies:

   cd functions
   npm install
   cd ..

6. Configure your own Firebase project and update the Firebase configuration files and deployment settings.

7. Start the Firebase Emulator Suite for local development:

   firebase emulators:start

**Note:** Firebase credentials, service account keys, and company data must be configured separately. Do not commit private credentials or production data to the repository.

## Project Background

This application was developed as part of my internship at Melaka Biotechnology Corporation (MBC) in Melaka, Malaysia.

The project involved developing a web-based system to support the company's internal data management processes, particularly in organizing customer information, laboratory testing records, and financial documentation.

It provided practical experience in web application development, database integration, Firebase services, and building software solutions for business operations.

## Disclaimer

This project was developed for internal company use during my internship. Company data, confidential information, and production credentials are not included in the public repository.
