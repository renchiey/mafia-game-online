# Mafia Card Game Online

> Web version of the Mafia card game. Eliminates the need for a game master.

## How to play
1. To start playing, hit create play or join game. (To join a game you must receive an invite link from somemone already in a room)

 ![landing page](https://github.com/CrazyBuff/mafia-game-online/blob/main/images/landing-page.png "landing page") 

3. After hitting one of the two buttons you'll end up in a lobby!

| lobby |
| --- |
| ![lobby page](https://github.com/CrazyBuff/mafia-game-online/blob/main/images/lobby.png "lobby page") |

4. As a room host, you can change the settings of the game to your desire and add roles (remember to hit save when changing settings!)

| settings | adding roles |
| --- | --- |
| ![settings](https://github.com/CrazyBuff/mafia-game-online/blob/main/images/settings.png "settings") | ![adding roles](https://github.com/CrazyBuff/mafia-game-online/blob/main/images/adding-roles.png "adding roles ") |

5. After following the steps above, you can start playing a game

| game |
| --- |
| ![game](https://github.com/CrazyBuff/mafia-game-online/blob/main/images/play-game.png "game") |

## Technologies/libraries used
### Client Side
[![My Skills](https://skillicons.dev/icons?i=vite,react,ts,tailwind)](https://skillicons.dev)
- Vite
- React
- TypeScript
- Tailwind
- react-use-websocket

### Server Side
[![My Skills](https://skillicons.dev/icons?i=nodejs,express,ts)](https://skillicons.dev)
- NodeJS
- Express
- TypeScript
- ws/websockets

## Self Hosting
If you wish to self host you can build your own Docker image for the client web server and websocket server using the Dockerfiles in the respective directories.
You can also use the prebuilt images linked to this repository.
> Note: For the client web server image, you cannot change the environment variables as they are set during build time. This means that the default URL and Websocket URL used for sending invite links and connecting to the Websocket server will be localhost:3000 and ws://localhost:8080, respectively, on the client side.

To run the client web server image:
1. pull the docker image
2. Run the command `docker run -p [PORT]:3000 mafia-client`

To run the Websocket server image:
1. pull the docker image
2. Run the command `docker run -p [PORT]:8080 mafia-server`



