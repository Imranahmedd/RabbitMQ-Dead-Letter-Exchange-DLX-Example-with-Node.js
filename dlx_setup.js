// dlx_setup.js
const amqp = require("amqplib");

async function setupDLX() {
  let connection;
  try {
    connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const dlxExchangeName = "my_dlx_exchange";
    const dlqQueueName = "my_dlq_queue";
    const dlxRoutingKey = "failed_messages"; // Optional: Use a routing key for DLQ

    // 1. Declare the Dead Letter Exchange (DLX)
    await channel.assertExchange(dlxExchangeName, "direct", {
      durable: true, // DLX should typically be durable
    });
    console.log(`Dead Letter Exchange '${dlxExchangeName}' asserted.`);

    // 2. Declare the Dead Letter Queue (DLQ)
    await channel.assertQueue(dlqQueueName, {
      durable: true, // DLQ should typically be durable
    });
    console.log(`Dead Letter Queue '${dlqQueueName}' asserted.`);

    // 3. Bind the DLQ to the DLX
    await channel.bindQueue(dlqQueueName, dlxExchangeName, dlxRoutingKey);
    console.log(
      `DLQ '${dlqQueueName}' bound to DLX '${dlxExchangeName}' with routing key '${dlxRoutingKey}'.`
    );
  } catch (error) {
    console.error("DLX setup error:", error);
  } finally {
    if (connection) {
      await connection.close();
      console.log("DLX setup connection closed.");
    }
  }
}

setupDLX();
