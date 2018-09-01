const puppeteer = require('puppeteer');

class TwitterAutoFollow {
    /**
     * Notre constructeur, permettra de saisir une configuration qui ne bougera pas
     *
     * @param authToken
     * @param userAgent
     * @param headless
     */
    constructor(authToken, userAgent, headless = true) {
        this.authToken = authToken;
        this.userAgent = userAgent;
        this.puppeteerConfig = {
            headless,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        };
    }

    /**
     * Initialisation du processus
     *
     * @returns {Promise<void>}
     */
    async init(authToken = '', userAgent = '') {
        this.browser = await puppeteer.launch(this.puppeteerConfig);
        this.authToken = authToken;
        this.userAgent = userAgent;
    }

    /**
     * Exécution des actions
     *
     * @param screenName
     * @param onlyWithAvatar
     * @param onlyWithBio
     * @param onlyIsNotProtected
     * @param onlyNoFollowBack
     * @returns {Promise<void>}
     */
    async followFollowers(screenName = 'pirmax', onlyWithAvatar = true, onlyWithBio = true, onlyIsNotProtected = true, onlyNoFollowBack = true) {
        this.screenName = screenName;

        this.page = await this.browser.newPage();
        this.page.on('console', consoleObj => console.log(consoleObj._text));
        await this.page.setUserAgent(this.userAgent);
        await this.page.setCookie({
            name: 'auth_token',
            value: this.authToken,
            domain: '.twitter.com',
            path: '/',
            expires: (new Date().getTime() + 86409000),
            httpOnly: true,
            secure: true
        });

        await this.page.goto('https://twitter.com/' + this.screenName + '/followers');
        await this.page.waitForNavigation();
        await this.page.evaluate(async (onlyWithAvatar, onlyWithBio, onlyIsNotProtected, onlyNoFollowBack) => {
            const elements = await document.querySelectorAll('div[data-test-selector="ProfileTimelineUser"]');

            for (const element of elements) {
                const profileIsProtected = !element.querySelector('span.Icon.Icon--protected');
                const profileIsAlreadyFollower = !element.querySelector('span.FollowStatus');
                const profileHasAvatar = !element.querySelector('img.ProfileCard-avatarImage.js-action-profile-avatar').getAttribute('src').includes('default_profile');
                const profileHasBio = element.querySelector('p.ProfileCard-bio').innerHTML !== '';
                const profileScreenName = element.querySelector('b.u-linkComplex-target');
                const followButton = element.querySelector('button.follow-text');

                if (profileIsProtected === onlyIsNotProtected
                    && profileIsAlreadyFollower === onlyNoFollowBack
                    && profileHasBio === onlyWithBio
                    && profileHasAvatar === onlyWithAvatar) {
                    followButton.click({delay: 500});
                    console.log('You follow ' + profileScreenName.innerHTML + ' on Twitter!');
                }
            }
        }, onlyWithAvatar, onlyWithBio, onlyIsNotProtected, onlyNoFollowBack);
    }

    /**
     * Permet de faire une pause entre chaque action
     *
     * @param milliseconds
     * @returns {Promise<any>}
     */
    async sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    /**
     * Clôture le processus
     *
     * @returns {Promise<void>}
     */
    async close() {
        await this.browser.close();
    }
}

module.exports = TwitterAutoFollow;