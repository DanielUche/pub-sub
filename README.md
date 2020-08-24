# pub-sub
A simple publish subscription implementation using nodejs, expres, redis and docker.

## Prerequisite

You need to have docker installed

## Steps to run
``cd project_dir
  ./start-server.sh
 ``
 This steps builds and start the container.
 
### Testing
$ curl -X POST -d '{ "url": "http://localhost:8000/event"}' http://localhost:8000/subscribe/topic1
$ curl -X POST -H "Content-Type: application/json" -d '{"message": "hello"}' http://localhost:8000/publish/topic1


You should see the events log on http://localhost:8000/event
You can add as many subsribers as you like and see then log events as they occur.
                
