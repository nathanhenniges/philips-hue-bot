const express = require('express');
const axios = require('axios');
const parse = require('parse-color');
const converter = require('@q42philips/hue-color-converter');

const passport = require('passport');

const HueStrategy = require('passport-hue').Strategy;

const router = express.Router();

const User = require('../models/User');

passport.use(
  new HueStrategy({
    clientID: process.env.MEETHUE_CLIENT_ID,
    clientSecret: process.env.MEETHUE_CLIENT_SECRET,
    appID: process.env.MEETHUE_APP_ID,
    deviceID: 'Twitch Hue Control',
    deviceName: 'Streaming PC'
  })
);

/**
 * @route /dashboard
 * @method GET
 * @description Load main dashboard
 */
router.get('/', async (req, res) => {
  res.render('dashboard');
});

/**
 * @route /dashboard/channel-points/default
 * @method POST
 * @description create channel points reward with the default that it will change the light with a html color code or color name
 */
router.post('/channel-points/default', async (req, res) => {
  try {
    const response = await axios({
      method: 'post',
      url: `https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${req.user.twitch.id}`,
      headers: {
        'client-id': process.env.TWITCH_CLIENT_ID,
        authorization: `Bearer ${req.user.twitch.accessToken}`,
        accept: 'application/json'
      },
      data: {
        title: 'Change lights color',
        cost: 250,
        prompt: 'Lets you change my lights to any hex code and or color name.',
        is_user_input_required: true,
        should_redemptions_skip_request_queue: true
      }
    });

    console.log(response.data.data[0]);

    const user = await User.findById(req.user.id);

    user.channelPoint.default = response.data.data[0].id;

    await user.save();

    res.json({
      message: 'Created reward',
      response: response.data
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

router.get('/hue', passport.authenticate('hue'));
router.get(
  '/hue/callback',
  passport.authenticate('hue', { session: false }),
  async (req, res) => {
    try {
      // access token is in req.user.accessToken
      // refresh token is in req.user.refreshToken
      // expires in req.user.expires_in seconds

      await axios({
        method: 'PUT',
        url: 'https://api.meethue.com/bridge/0/config',
        headers: {
          authorization: `Bearer ${req.user.accessToken}`,
          accept: 'application/json'
        },
        data: { linkbutton: true }
      });

      const response = await axios({
        method: 'POST',
        url: 'https://api.meethue.com/bridge/',
        headers: {
          authorization: `Bearer ${req.user.accessToken}`,
          accept: 'application/json'
        },
        data: { devicetype: process.env.MEETHUE_APP_ID }
      });

      const user = await User.find({});
      user[0].meethue.connected = true;
      user[0].meethue.accessToken = req.user.accessToken;
      user[0].meethue.refreshToken = req.user.refreshToken;
      user[0].meethue.expiresIn = req.user.expires_in;
      user[0].meethue.username = response.data[0].success.username;

      await user[0].save();
      res.redirect('/dashboard');
    } catch (err) {
      console.log(err);
      res.send(err);
    }
  }
);

/**
 * @route /dashboard/groups
 * @method GET
 * @description Get light groups
 */
router.get('/groups', async (req, res) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.meethue.com/bridge/${req.user.meethue.username}/groups`,
      headers: {
        authorization: `Bearer ${req.user.meethue.accessToken}`
      }
    });

    res.json(response.data);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

/**
 * @route /dashboard/groups
 * @method POST
 * @description Get light groups
 */
router.post('/groups', async (req, res) => {
  try {
    const user = await User.find({});
    user[0].lightgroup.default = req.body.group;
    await user[0].save();
    res.json({ message: 'Light has been set' });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

/**
 * @route /dashboard/groups
 * @method POST
 * @description Get light groups
 */
router.post('/groups/:id', async (req, res) => {
  try {
    const colorParsed = parse(req.body.color);
    const xy = converter.calculateXY(
      colorParsed.rgb[0],
      colorParsed.rgb[1],
      colorParsed.rgb[2]
    );

    await axios({
      method: 'PUT',
      url: `https://api.meethue.com/bridge/${req.user.meethue.username}/groups/${req.params.id}/action`,
      headers: {
        authorization: `Bearer ${req.user.meethue.accessToken}`
      },
      data: {
        on: true,
        bri: 254,
        sat: 254,
        xy,
        effect: 'none'
      }
    });
    res.json({ message: `Color has been changed to ${req.body.color}` });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
module.exports = router;
