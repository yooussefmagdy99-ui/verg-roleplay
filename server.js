require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

app.post('/buy', async (req, res) => {
  const { player, item, price, payment } = req.body;
  await db.promise().query(
    'INSERT INTO purchases (player,item,price,payment,status) VALUES (?,?,?,?,?)',
    [player,item,price,payment,'pending']
  );

  if (process.env.DISCORD_WEBHOOK) {
    await axios.post(process.env.DISCORD_WEBHOOK, {
      embeds:[{title:"New Purchase",fields:[
        {name:"Player",value:player},
        {name:"Item",value:item},
        {name:"Payment",value:payment}
      ]}]
    });
  }

  res.json({success:true});
});

app.listen(process.env.PORT || 3000);