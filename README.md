# remote-sky

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start
# or for live startup with a custom internal port
$ npm run start -- --port 3001

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out the [documentation](https://nuxtjs.org).

## Special Infos

On production we use port 443 also for the websocket connection. The nginx proxy redirects the websocket traffic (identified by subroute "/myapp") to the internal port 9001.

Here's an examplatory nginx config for proxying https & wss traffic through nginx. SSL certificates are maintained by Certbot.
```
server {
    root /var/www/remote-sky;

    index index.html index.htm index.nginx-debian.html;
    server_name remote-sky.hawc.de www.remote-sky.hawc.de; # managed by Certbot


    location ^~ /assets/ {
        gzip_static on;
        expires 12h;
        add_header Cache-Control public;
    }

    location /myapp/ {
        proxy_http_version 1.1;
        proxy_cache_bypass $http_upgrade;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        #proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        #proxy_set_header X-Forwarded-Proto $scheme;

        proxy_pass http://localhost:9001;
    }
    location / {
        proxy_http_version 1.1;
        proxy_cache_bypass $http_upgrade;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_pass http://localhost:3001;
    }

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/remote-sky.hawc.de/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/remote-sky.hawc.de/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.remote-sky.hawc.de) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = remote-sky.hawc.de) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80 ;
    listen [::]:80 ;
    server_name remote-sky.hawc.de www.remote-sky.hawc.de;
    return 404; # managed by Certbot
}
```