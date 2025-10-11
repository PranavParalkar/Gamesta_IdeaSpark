Deployment to Google Cloud (Cloud Run) + Cloud SQL (MySQL)

High level steps:
1. Create a Google Cloud project and enable APIs: Cloud Run, Cloud SQL Admin, Artifact Registry (optional), IAM.
2. Create a Cloud SQL for MySQL instance and a database/user. Note the instance connection name.
3. Deploy the app to Cloud Run. Use the Cloud SQL Auth proxy or connect via the Cloud Run connector by specifying `--add-cloudsql-instances`.
4. Set environment variables in Cloud Run for DB host (use the Cloud SQL instance connection via the connector), DB_USER, DB_PASSWORD, DB_NAME, and Google OAuth keys.
5. Run the SQL migration (upload `migrations/001_init.sql` and run it against the Cloud SQL instance using `gcloud sql connect` or from a client).
6. Map your domain `gamesta.in` to the Cloud Run service using the Cloud Run domain mapping UI and update DNS records at your registrar to the provided IP/CNAME. Configure HTTPS with managed certificates.

Notes:
- Use the Cloud SQL Auth proxy or Cloud Run's serverless vpc connector + add-cloudsql-instances flag for secure connections.
- For OAuth, configure Authorized Redirect URIs in Google Cloud Console to include `https://<your-domain>/api/auth/callback/google`.
