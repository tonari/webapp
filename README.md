# Tonari webapp

Tonari (from the Japanese 隣 which means "next door" / "the closest to you") is a webapp and API that enables searching for wheelchair-accessible sanitary facilities and enhancing the related datasets.

Check the live version out: https://tonari.app

This webapp is a front end for Tonari designed for mobile phones.

## Development environment

First, [install yarn](https://yarnpkg.com/lang/en/docs/install/).

Then install the dependencies:

```bash
yarn install
```

Acquire tokens for the following APIs:
* [Accessibility Cloud](https://www.accessibility.cloud)
* [Wheelmap](https://wheelmap.org/)
* [Mapbox](https://www.mapbox.com/)
* [MapQuest](https://www.mapquest.com/)

Create a `.env` file in the root directory with the following layout:

```
REACT_APP_ACCESSIBILITY_CLOUD_TOKEN=
REACT_APP_WHEELMAP_TOKEN=
REACT_APP_MAPBOX_TOKEN=
REACT_APP_MAPQUEST_TOKEN=
```

Then you can start a local server:

```bash
yarn start
```

Note that you can also run this command without starting a browser:

```bash
BROWSER=none yarn start
```

## Test webapp on mobile phone

If you want to test the webapp on your mobile phone, you have to create a HTTPS proxy in order to be able to request the GPS position.

First, generate a SSL keypair:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout private.pem -out public.pem  -subj "/C=AA/ST=A/L=A/O=A/OU=A/CN=A"
```

Here is a exemplary Nginx setup for this:

```
http {
        server {
                server_name localhost;
                listen 3001 ssl;
                ssl_protocols TLSv1.2;
                ssl_certificate public.pem;
                ssl_certificate_key private.pem;

                location / {
                        proxy_pass http://127.0.0.1:3000;
                }
        }
}
```

## Modes

There are different modes that the webapp can run in:

* The `production` mode uses the production backend.
* The `staging` mode uses the staging backend. The idea of the staging backend is to have a seperate database that can be polluted during development.
* The `debugging` mode activates console logs and other debugging utilities (such as a fake Now search from the cluster). Furthermore it also makes use of the staging backend.
* The `experimental` mode activates work-in-progress features.
* The `presenting` mode limits the width and height of the website to the size of a phone.

When using the webapp via `yarn start` then the parameter `staging` is implicit.
When using it via `yarn build` then the parameter `production` is implicit.
Setting `production` or `staging` explicitly overwrites the implicit behavior.
The `debugging` mode always overwrites the behavior of both `production` and `staging`.

The order of the parameters doesn't matter.

For example, you can use the URL https://tonari.app/?experimental&staging#/now to activate both the experimental and staging mode.

## License

While the code is licensed under the MIT license (see `LICENSE`), the icons and the logo are licensed under CC0-1.0 (see `src/res/attribute-icons/LICENSE`), and Montserrat is licensed under OFL (see `src/fonts/LICENSE`).
