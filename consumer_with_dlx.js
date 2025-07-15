const amqp = require("amqplib");

async function receiveMessages() {
  let connection;
  try {
    connection = await amqp.connect("amqp://localhost");
    console.log("Consumer connected to RabbitMQ");

    const channel = await connection.createChannel();
    console.log("Consumer channel created");

    const mainQueueName = "main_app_queue";
    const dlxExchangeName = "my_dlx_exchange";
    const dlxRoutingKey = "failed_messages";

    // 3. Declare the main queue (again, for idempotency and consistency)
    await channel.assertQueue(mainQueueName, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": dlxExchangeName,
        "x-dead-letter-routing-key": dlxRoutingKey,
      },
    });
    console.log(
      `[*] Waiting for messages in '${mainQueueName}'. To exit press CTRL+C`
    );

    channel.consume(
      mainQueueName,
      (msg) => {
        if (msg.content) {
          const messageContent = msg.content.toString();
          console.log(`[x] Received: '${messageContent}'`);

          // Simulate processing logic and potential failure
          if (
            messageContent.includes("Task message 2") ||
            messageContent.includes("Task message 4")
          ) {
            console.log(
              `[!] Failed to process: '${messageContent}'. Nacking to DLX.`
            );
            // Negatively acknowledge and do NOT requeue to original queue
            channel.nack(msg, false, false);
          } else {
            console.log(
              `[v] Successfully processed: '${messageContent}'. Acknowledging.`
            );
            channel.ack(msg);
          }
        }
      },
      {
        noAck: false, // Important: must be false for manual acknowledgment and nacking
      }
    );
  } catch (error) {
    console.error("Consumer error:", error);
    if (connection) {
      connection.close();
    }
  }
}

receiveMessages();
