# IoTgo-Pro

## Introdution

IoTgo-Pro is an open source IoT platform which second developing based on the IoTgo-Pro project, like WordPress, ZenCart and all other open source software, you can deploy your own IoTgo-Pro cloud service.

We at ITEAD Studio are committed to provide a complete set of hardware for IoTgo-Pro with open source hardware designs and open source firmware.

The overall IoTgo-Pro system architecture including IoTgo-Pro, IoTgo-Pro-compatible apps and IoTgo-Pro-compatible devices is illustrated by following graph.

![IoTgo-Pro System Architecture](docs/iotgo-arch.png)

Single-board microcontroller (like Arduino) developers, single-board computer (like Raspberry PI) developers and other embedded system developers could use IoTgo-Pro Device API to connect their devices to IoTgo-Pro and then easily control their devices by utilizing IoTgo-Pro Web App.

Note: we also provide IoTgo-Pro-compatible Device Library which wraps IoTgo-Pro Device API. Please refer to [IoTgo-Pro Arduino Library](https://github.com/itead/ITEADLIB_Arduino_IoTgo-Pro), [IoTgo-Pro Segnix Library](https://github.com/itead/Segnix/tree/master/libraries/itead_IoTgo-Pro) for details.

Web developers and mobile developers could use IoTgo-Pro Web API to build various apps that manage devices connected to IoTgo-Pro. To control those devices, IoTgo-Pro Device API can be used.

**In one word, we want to provide cloud capability for device developers and device capability for app developers.**

For more detailed information and a working IoTgo-Pro cloud service, please head over to [IoTgo-Pro.iteadstudio.com](http://iotgo.iteadstudio.com/).

**If you have any advice, please contact us. We sincerely appreciate it.**

## Features

### Old features
- device: create、delete、update、query devices
- user: create、delete、update、query users
- manager: create、delete、update、query manager and manage user

### New features

## Chinese docs

- [中文文档](https://github.com/sunfeng90/IoTgo-Pro/blob/master/docs/chinese-docs.md)

## Installation
### （1）Installation [Automatically *almost*]

If you just want to get a feel of IoTgo-Pro, or deploy it for internal use, we recommend [IoTgo-Pro docker image](https://registry.hub.docker.com/u/humingchun/IoTgo-Pro/) which could set up a IoTgo-Pro instance by only 4 commands and within 3 minutes (depends on your internet bandwidth).

*Note: `IoTgo-Pro docker image` should not be used in production environment, because it lacks several security features, such as Google reCAPTCHA*

### Prerequisite

- NodeJS Version: 6.8.*.

- [Docker](https://www.docker.com/): An open platform for distributed applications for developers and sysadmins.

### Install IoTgo-Pro

```
sudo docker pull dockerfile/mongodb
sudo docker pull humingchun/IoTgo-Pro
sudo docker run -d --name mongodb dockerfile/mongodb mongod --smallfiles
sudo docker run -d -p 80:80 --name IoTgo-Pro --link mongodb:mongodb humingchun/IoTgo-Pro node /opt/IoTgo-Pro/bin/www
```

And that's all! You can now access IoTgo-Pro at your linux box's ip address and port 80.

If you want to use another port instead of 80, change the `-p` option in the last command from 80 to any other port, such as `-p 3000:80`.

The admin panel is at http://linuxBoxIp:linuxBoxPort/admin, and the default admin account is `IoTgo-Pro@iteadstudio.com`, corresponding password is `password`. If you want to change the default account and password, you can use `sudo docker exec -i -t IoTgo-Pro /bin/bash` to login IoTgo-Pro docker container and use text editor (vi for example) to change admin information in the `config.js` file.

### (2) Installation [Manually]

Install IoTgo-Pro manually takes some effort, but it also means everything is under control.

### Prerequisite

- [Git](http://git-scm.com/): Free and open source distributed version control system designed to handle everything from small to very large projects with speed and efficiency.

- [MongoDB](https://www.mongodb.org/): Open-source document database, the leading NoSQL database

- [Node.js](http://nodejs.org/): An asynchronous JavaScipt event driven framework, and yes, JavaScript on the server!

- [Forever](https://www.npmjs.org/package/forever): Running Node application as system service.

- [Bower](http://bower.io/): A package manager for the web, optimized for the front-end.

### Install in CentOS 6
```
yum install git
yum install mongodb
yum install npm
npm install forever -g
npm install bower
```

### Install IoTgo-Pro

Get IoTgo-Pro source code from github.com

```
git clone https://github.com/sunfeng90/IoTgo-Pro.git
```

Change directory to downloaded IoTgo-Pro and install dependencies.

```
cd IoTgo-Pro && npm install
```

Change directory to IoTgo-Pro Web App frontend and install dependencies.

```
cd public/frontend && bower install
```

Change directory to IoTgo-Pro Web App backend and install dependencies.

```
cd ../backend && bower install
```

Change directory back to IoTgo-Pro root

```
cd ../..
```
### Configure IoTgo-Pro

Edit config.js and change corresponding fields to reflect your hosting environment.

```js
module.exports = {
    host: 'localhost',                           // Hostname of IoTgo-Pro
    db: {
        uri: 'mongodb://localhost/IoTgo-Pro',   // MongoDB database address
        options: {
            user: 'IoTgo-Pro',                  // MongoDB database username
            pass: 'IoTgo-Pro'                   // MongoDB database password
        }
    },
    jwt: {
        secret: 'jwt_secret'                    // Shared secret to encrypt JSON Web Token
    },
    admin:{
        'sfenghappy@sina.com': '123456'         // Administrator account of IoTgo-Pro
    },
    page: {
        limit: 50,                              // Default query page limit
        sort: -1                                // Default query sort order
    },
    recaptcha: {
		secret: 'reCAPTCHA secret key',			// https://developers.google.com/recaptcha/intro
        url: 'https://www.google.com/recaptcha/api/siteverify'
    }
};
```

Edit public/frontend/views/signup.html and add your reCAPTCHA site key applied from Google

```html
<div ng-model="response" class="form-group" g-recaptcha
    g-recaptcha-sitekey="Your reCAPTCHA site key goes here"></div>
```

### IoTgo-Pro as System Service

To manage IoTgo-Pro like system service, such as:

```
sudo service IoTgo-Pro start  // Start IoTgo-Pro
sudo service IoTgo-Pro stop // Stop IoTgo-Pro
```

and make IoTgo-Pro start automatically during OS boot, we can create init scripts utilizing [Forever](https://www.npmjs.org/package/forever) or [PM2](http://pm2.keymetrics.io/)to monitor IoTgo-Pro.

```
pm2 start bin/www
pm2 stop bin/www
```

The following init script is a working example. If you want to use it, please put the script in `/etc/init.d/` folder and change file permission to 755. You may also need to change `NAME`, `NODE_PATH`, `NODE_APPLICATION_PATH` to reflect your hosting environment.

```
sudo touch /etc/init.d/IoTgo-Pro
sudo chmod 755 /etc/init.d/IoTgo-Pro
sudo update-rc.d IoTgo-Pro defaults
```

*Note: please refer to [Node.js and Forever as a Service: Simple Upstart and Init Scripts for Ubuntu](https://www.exratione.com/2013/02/nodejs-and-forever-as-a-service-simple-upstart-and-init-scripts-for-ubuntu/) for detailed explanations of the script.*

```bash
#!/bin/bash
#
# An init.d script for running a Node.js process as a service using Forever as
# the process monitor. For more configuration options associated with Forever,
# see: https://github.com/nodejitsu/forever
#
# This was written for Debian distributions such as Ubuntu, but should still
# work on RedHat, Fedora, or other RPM-based distributions, since none of the
# built-in service functions are used. So information is provided for both.
#

NAME="ITEAD IoTgo-Pro"
NODE_BIN_DIR="/usr/bin:/usr/local/bin"
NODE_PATH="/home/itead/IoTgo-Pro/node_modules"
APPLICATION_PATH="/home/itead/IoTgo-Pro/bin/www"
PIDFILE="/var/run/IoTgo-Pro.pid"
LOGFILE="/var/log/IoTgo-Pro.log"
MIN_UPTIME="5000"
SPIN_SLEEP_TIME="2000"

PATH=$NODE_BIN_DIR:$PATH
export NODE_PATH=$NODE_PATH

start() {
    echo "Starting $NAME"
    forever \
      --pidFile $PIDFILE \
      -a \
      -l $LOGFILE \
      --minUptime $MIN_UPTIME \
      --spinSleepTime $SPIN_SLEEP_TIME \
      start $APPLICATION_PATH 2>&1 > /dev/null &
    RETVAL=$?
}

stop() {
    if [ -f $PIDFILE ]; then
        echo "Shutting down $NAME"
        forever stop $APPLICATION_PATH 2>&1 > /dev/null
        rm -f $PIDFILE
        RETVAL=$?
    else
        echo "$NAME is not running."
        RETVAL=0
    fi
}

restart() {
    stop
    start
}

status() {
    echo `forever list` | grep -q "$APPLICATION_PATH"
    if [ "$?" -eq "0" ]; then
        echo "$NAME is running."
        RETVAL=0
    else
        echo "$NAME is not running."
        RETVAL=3
    fi
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    status)
        status
        ;;
    restart)
        restart
        ;;
    *)
        echo "Usage: {start|stop|status|restart}"
        exit 1
        ;;
esac
exit $RETVAL
```

## Running IoTgo-Pro

To run IoTgo-Pro, you can start it in console mode

```
DEBUG="IoTgo-Pro" ./bin/www
```

To run IoTgo-Pro on other port instead of 80, you can use PORT environment variable.

```
PORT="3000" DEBUG="IoTgo-Pro" ./bin/www
```

To run IoTgo-Pro as system service

```
sudo service IoTgo-Pro start
```
## API

- [API](https://github.com/sunfeng90/IoTgo-Pro/blob/master/docs/api-docs.md)

## Supported Browsers

IoTgo-Pro Web App currently supports the current and prior major release of Chrome, Firefox, Internet Explorer and Safari on a rolling basis, which means IE6/IE7/IE8/IE9 will not work properly.

## Contributors

frank-sun(The author of IoTgo-Pro)--https://github.com/sunfeng90
humingchun(The author of IoTgo)--https://github.com/humingchun

## Support

## License

- [MIT](https://github.com/itead/IoTgo-Pro/blob/master/LICENSE)
