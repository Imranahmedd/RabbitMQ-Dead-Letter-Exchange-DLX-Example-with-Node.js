const amqp = require("amqplib");

async function consumeDLQ() {
  let connection;
  try {
    connection = await amqp.connect("amqp://localhost");
    console.log("DLQ Consumer connected to RabbitMQ");

    const channel = await connection.createChannel();
    console.log("DLQ Consumer channel created");

    const dlqQueueName = "my_dlq_queue";
    const dlxExchangeName = "my_dlx_exchange";
    const dlxRoutingKey = "failed_messages";

    // Declare DLX and DLQ (idempotent, good practice to ensure they exist)
    await channel.assertExchange(dlxExchangeName, "direct", { durable: true });
    await channel.assertQueue(dlqQueueName, { durable: true });
    await channel.bindQueue(dlqQueueName, dlxExchangeName, dlxRoutingKey);

    console.log(
      `[*] Waiting for dead-lettered messages in '${dlqQueueName}'. To exit press CTRL+C`
    );

    channel.consume(
      dlqQueueName,
      (msg) => {
        if (msg.content) {
          const messageContent = msg.content.toString();
          console.warn(
            `[DLQ] Received dead-lettered message: '${messageContent}'`
          );
          // You can now inspect the message, log it, save it to a database,
          // or even attempt to re-process it (with proper retry logic to avoid cycles).

          // Acknowledge the message from the DLQ
          channel.ack(msg);
        }
      },
      {
        noAck: false,
      }
    );
  } catch (error) {
    console.error("DLQ Consumer error:", error);
    if (connection) {
      connection.close();
    }
  }
}

consumeDLQ();
