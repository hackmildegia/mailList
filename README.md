Mail list manager coded on sailsjs. We use those npm packages:

   * sails-generate-auth: Local authentication on disk.
   * mail-listener2 to listen to IMAP
   * emailjs for sending emails


=== Configuration ===

Add this to app/local.js:

	mailListener: {
        username: 'email@domain.com',
        password: "password",
        host: "host",
        port: 993,
        mailbox: "INBOX", // mailbox to monitor
    }
