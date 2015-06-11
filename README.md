Mail list manager coded on sailsjs. We use those npm packages:

   * sails-generate-auth: Local authentication on disk.
   * mail-listener2 to listen to IMAP
   * emailjs for sending emails


=== Instalation ===

1. npm install.

2. Add this to app/local.js:

	mailListener: {
        username: 'email@domain.com',
        password: "password",
        host: "host",
        port: 993,
        mailbox: "INBOX", // mailbox to monitor
    }

3. sails lift to start mailList.

=== Administration ==

One admin created. Its username is **admin** and password **adminadmin**. 

You can login on http://localhost:1337/login