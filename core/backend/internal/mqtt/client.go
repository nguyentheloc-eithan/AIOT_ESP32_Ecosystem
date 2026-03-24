package mqtt

import (
	"fmt"
	"log"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

type Client struct {
	client mqtt.Client
}

// NewClient creates a new MQTT client and connects to the broker
func NewClient(broker, port string) (*Client, error) {
	opts := mqtt.NewClientOptions()
	opts.AddBroker(fmt.Sprintf("tcp://%s:%s", broker, port))
	opts.SetClientID("aiot-backend-" + time.Now().Format("20060102150405"))
	opts.SetCleanSession(true)
	opts.SetAutoReconnect(true)
	opts.SetConnectRetry(true)
	opts.SetConnectRetryInterval(5 * time.Second)
	opts.SetMaxReconnectInterval(30 * time.Second)

	opts.OnConnect = func(c mqtt.Client) {
		log.Println("✅ MQTT Connected")
	}

	opts.OnConnectionLost = func(c mqtt.Client, err error) {
		log.Printf("⚠️  MQTT Connection Lost: %v", err)
	}

	opts.OnReconnecting = func(c mqtt.Client, opts *mqtt.ClientOptions) {
		log.Println("🔄 MQTT Reconnecting...")
	}

	client := mqtt.NewClient(opts)
	token := client.Connect()
	if token.Wait() && token.Error() != nil {
		return nil, fmt.Errorf("failed to connect: %v", token.Error())
	}

	return &Client{client: client}, nil
}

// Publish publishes a message to a topic
func (c *Client) Publish(topic string, payload interface{}) error {
	token := c.client.Publish(topic, 0, false, payload)
	token.Wait()
	return token.Error()
}

// Subscribe subscribes to a topic with a message handler
func (c *Client) Subscribe(topic string, handler mqtt.MessageHandler) error {
	token := c.client.Subscribe(topic, 0, handler)
	token.Wait()
	return token.Error()
}

// Disconnect disconnects from the MQTT broker
func (c *Client) Disconnect() {
	c.client.Disconnect(250)
	log.Println("👋 MQTT Disconnected")
}

// IsConnected returns whether the client is connected
func (c *Client) IsConnected() bool {
	return c.client.IsConnected()
}
