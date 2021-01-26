const TwitchStrategy = require('passport-twitch-new').Strategy;

/**
 * Load MongoDB models.
 */
const User = require('../models/User');

module.exports = passport => {
  passport.use(
    new TwitchStrategy(
      {
        clientID: process.env.TWITCH_CLIENT_ID,
        clientSecret: process.env.TWITCH_CLIENT_SECRET,
        callbackURL: 'http://localhost:1234/callback',
        scope:
          'channel:manage:redemptions channel:read:redemptions chat:read chat:edit'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(profile);
          let user = await User.findOne({ username: profile.display_name });
          if (!user) {
            user = await User.create({
              username: profile.display_name,
              profile_image_url: profile.profile_image_url,
              twitch: {
                id: profile.id,
                accessToken,
                refreshToken
              }
            });
            await user.save();
            return done(null, user);
          }
          // eslint-disable-next-line dot-notation
          user.username = profile.display_name;
          user.profile_image_url = profile.profile_image_url;
          user.twitch.accessToken = accessToken;
          user.twitch.refreshToken = refreshToken;

          await user.save();
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
};
