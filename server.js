const express = require('express');
const bodyParser = require('body-parser');
const KJUR = require('jsrsasign');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const app = express();
const port = 4000;

const SDK_KEY = process.env.SDK_KEY;
const SDK_SECRET = process.env.SDK_SECRET;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const USER_ID = process.env.USER_ID;

app.use(bodyParser.json());
app.use(cors({
    origin: '*', 
    methods: ['*'], 
}));

function generateSignature(key, secret, meetingNumber, role, authUserId) {

  const iat = Math.floor(Date.now() / 1000); // Issued at time
  const exp = iat + 60 * 60 * 2 // Token expiration time set to two hour
  const oHeader = { alg: 'HS256', typ: 'JWT' };

  const oPayload = {
    sdkKey: key,
    appKey: key,
    mn: meetingNumber,
    role: role,
    iat: iat,
    exp: exp,
    tokenExp: exp
  };
  console.log("ROLE: ", role);

  const sHeader = JSON.stringify(oHeader);
  const sPayload = JSON.stringify(oPayload);
  const sdkJWT = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, secret);
  return sdkJWT;
}

function generateZoomApiJWT() {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    iss: API_KEY,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour expiration
  };

  const stringHeader = JSON.stringify(header);
  const stringPayload = JSON.stringify(payload);

  return KJUR.jws.JWS.sign('HS256', stringHeader, stringPayload, API_SECRET);
}

app.post('/create_meeting', async (req, res) => {
  const token = generateZoomApiJWT();
  console.log("Token:===== ", token);
  try {
    const response = await axios.post(
      `https://api.zoom.us/v2/users/${USER_ID}/meetings`,
      {
        topic: "Meeting created via API",
        type: 1, // Instant meeting
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          mute_upon_entry: true,
          approval_type: 0,
          audio: "both",
          auto_recording: "none"
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'Zoom-api-Jwt-Request',
          'content-type': 'application/json'
        }
      }
    );

    const { id: meetingNumber, password: meetingPassword } = response.data;
    const signature = generateSignature(SDK_KEY, SDK_SECRET, meetingNumber, 1, '65b0d02d60023489a81394db');

    res.json({
      signature,
      meetingNumber,
      password: meetingPassword,
      sdkKey: SDK_KEY
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

app.post('/zoom_auth_jwt', (req, res) => {
  const { meetingNumber, role } = req.body;

  console.log(req.body);

  if (!meetingNumber || typeof role !== 'number') {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const jwt = generateSignature(SDK_KEY, SDK_SECRET, meetingNumber, role);
  
  console.log("jwt: ", jwt);
  res.json({ signature: jwt });
});


app.get('/zoom_jwt', (req, res) => {
  try {
    const iat = Math.floor(Date.now() / 1000); 
    const exp = iat + (90 * 60); 

    const payload = {
      iss: API_KEY, 
      exp: exp,    
    };

    const token = jwt.sign(payload, API_SECRET);

    res.json({
      token: token
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: 'Error generating JWT'
    });
  }
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});