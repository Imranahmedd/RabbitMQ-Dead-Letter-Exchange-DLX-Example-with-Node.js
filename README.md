docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management #TERMINAL 1
node dlx_setup.js #TERMINAL 2
node dlq_consumer.js #TERMINAL 3
node consumer_with_dlx.js #TERMINAL 4
node producer_with_dlx.js #TERMINAL 5
