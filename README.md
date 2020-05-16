# White - Leaf

A container of articles and pictures

## Contents

-   User can create own profile.
-   User can upload articles and pictures here.
-   User can see other users profile and articles.
-   User can edit and delete his own profile and articles.
-   There is one admin of this whole site who can access this whole site, edit and delete anyone's data.

## Restrictions

-   User cannot create profile and add article unless he registers himself.
-   User cannot modify other user's profile and article.
-   User cannot visit admin profile.
-   Every user must have different email id.

## Prerequisite

-   npm must be installed in your machine.
-   Whole project uses mongodb database so either you must have online mongodb account or local mongodb.

## Steps

-   Clone this whole project and open folder in and code editor.
-   Create folder "images" inside public folder.
-   Create .env file inside White-Leaf folder.
-   Then add following field inside .env file do not include text written after //.

```env
my_email = admin@gmail.com                // Email id of admin
database = mongodb://localhost:27017      // link to mongodb here I am using local
secret = my_secret                        // any word
PORT = 5000                               // port number
```

-   Open terminal in White-Leaf folder and run following commands.

```
npm install                           // only first time
node app.js
```

-   Open browser and enter following url. Instead of 5000 enter the port number selected above.

```url
http://localhost:5000
```

This will open your website locally. Now you should first register and then login to add article.

Remember that also Admin have to register himself.
