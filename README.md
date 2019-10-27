# Speed Tracker

Track your network download, upload and ping.

Set interval you wish to run and track progress via a simple GUI.

| Variable                 | Default          | Info                                                       |
| ------------------------ | ---------------- | ---------------------------------------------------------- |
| `PORT`                   | `80`             |                                                            |
| `INTERVAL`               | `*/30 * * * *`   | Crontab interval to test network, default is every 30 mins |
| `DATABASE_JSON_FILEPATH` | `./data/db.json` | Path to db file used to store all network metrics          |

Example `docker-compose` config:

```yaml
version: '3.4'
services:
  speed-tracker:
    container_name: speed-tracker
    image: labithiotis/speed-tracker
    restart: always
    ports:
      - '8000:8000'
    environment:
      PORT: '8000'
      INTERVAL: '*/30 * * * *'
      DATABASE_JSON_FILEPATH: './data/db.json'
    volumes:
      - './data:/usr/src/app/data'
```
