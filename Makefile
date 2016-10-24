
# Leave as if if you 're just using, customizing or extending the machine
# Change ip to your docker account if you plan to package and release your own docker image
DOCKER_ACCOUNT=objectisadvantag

# Set this the your Host interface if you use DockerToolbox, otherwise leave it to 127.0.01
DOCKER_HOST_IPADDRESS=192.168.99.100


default: dev

dev:
	DEBUG=samples*,sparkbot* node templates/on-event-all-all.js

run:
	(lt -s sparkbot -p 8080 &)
	node templates/on-event-all-all.js

dimage:
	docker build -t $(DOCKER_ACCOUNT)/node-sparkbot-samples .

ddev: 
	docker run -it -p 8080:8080 $(DOCKER_ACCOUNT)/node-sparkbot-samples

drun: 
	(lt -s sparkbot -l $(DOCKER_HOST_IPADDRESS) -p 8080 &)
	docker run -it -p 8080:8080 $(DOCKER_ACCOUNT)/node-sparkbot-samples
    

