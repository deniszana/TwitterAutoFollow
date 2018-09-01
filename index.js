const TwitterAutoFollow = require('./TwitterAutoFollow.class');
const schedule = require('node-schedule');

const taf = new TwitterAutoFollow(
    '8f0422ef26222xxxxxxxxxxxxe79afc52a636440',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
    false
);

schedule.scheduleJob('*/15 * * * *', async () => {
    await taf.init();
    await taf.sleep(5000);
    await taf.followFollowers('instagram', true, true, true, true);
    await taf.sleep(5000);
    await taf.followFollowers('twitter', true, true, true, true);
    await taf.sleep(5000);
    await taf.close();
});
