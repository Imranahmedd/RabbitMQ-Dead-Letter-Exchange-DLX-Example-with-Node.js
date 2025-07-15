const amqp = require("amqplib");

async function sendMessages() {
  let connection;
  try {
    connection = await amqp.connect("amqp://localhost");
    console.log("Producer connected to RabbitMQ");

    const channel = await connection.createChannel();
    console.log("Producer channel created");

    const mainQueueName = "main_app_queue";
    const dlxExchangeName = "my_dlx_exchange";
    const dlxRoutingKey = "failed_messages"; // Must match the one used in DLQ binding

    // 3. Declare the main queue, linking it to the DLX
    await channel.assertQueue(mainQueueName, {
      durable: true, // Make main queue durable for persistence
      arguments: {
        "x-dead-letter-exchange": dlxExchangeName,
        "x-dead-letter-routing-key": dlxRoutingKey, // Optional: if you want a specific routing key for DLX
      },
    });
    console.log(`Main queue '${mainQueueName}' asserted with DLX config.`);

    // Send some messages
    for (let i = 0; i < 5; i++) {
      const message = `Task message ${i}`;
      channel.sendToQueue(mainQueueName, Buffer.from(message), {
        persistent: true,
      });
      console.log(`[x] Sent '${message}' to '${mainQueueName}'`);
    }
  } catch (error) {
    console.error("Producer error:", error);
  } finally {
    if (connection) {
      setTimeout(() => {
        connection.close();
        console.log("Producer connection closed");
        process.exit(0);
      }, 500);
    }
  }
}

sendMessages();
