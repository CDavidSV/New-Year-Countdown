package main

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"slices"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Hub struct {
	connections map[*websocket.Conn]*Client
	logger      *slog.Logger
	connMutext  sync.RWMutex
}

type Firework struct {
	ScreenWidth       int    `json:"screenWidth"`
	ScreenHeight      int    `json:"screenHeight"`
	InitX             int    `json:"initX"`
	InitY             int    `json:"initY"`
	EndX              int    `json:"endX"`
	EndY              int    `json:"endY"`
	Color             string `json:"color"`
	FireworksLaunched uint64 `json:"fireworksLaunched"`
}

type WSMessage struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}

type Client struct {
	conn         *websocket.Conn
	send         chan WSMessage
	reqPerWindow int
	lastReqTime  time.Time
}

var limitWindow = 15 * time.Second
var maxReqPerWindow = 50

var upgrader = websocket.Upgrader{
	CheckOrigin:       originChecker,
	EnableCompression: true,
} // use default options

func NewWebsocketHub(logger *slog.Logger) *Hub {
	return &Hub{
		connections: make(map[*websocket.Conn]*Client),
		logger:      logger,
	}
}

func NewClient(conn *websocket.Conn) *Client {
	return &Client{
		conn:         conn,
		send:         make(chan WSMessage),
		reqPerWindow: 0,
		lastReqTime:  time.Now(),
	}
}

func originChecker(r *http.Request) bool {
	if allowedDomains == "" {
		return true
	}

	return slices.Contains(allowedDomainsSlice, r.Header.Get("Origin"))
}

func (h *Hub) wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		h.logger.Error("Error upgrading connection: ", "error", err.Error())
		return
	}

	if err := conn.SetCompressionLevel(4); err != nil {
		h.logger.Error("Error setting compression level: ", "error", err.Error())
		return
	}

	client := h.addConnection(conn)
	client.conn.WriteJSON(WSMessage{Type: "init", Payload: GetFireworksCount()})

	defer h.removeConnection(client)

	go h.writePump(client)
	h.readPump(client)
}

func (h *Hub) addConnection(conn *websocket.Conn) *Client {
	h.logger.Info("new connection established", "ip", conn.RemoteAddr().String())

	h.connMutext.Lock()
	defer h.connMutext.Unlock()

	client := NewClient(conn)
	h.connections[conn] = client

	return client
}

func (h *Hub) removeConnection(client *Client) {
	h.logger.Info("connection closed", "ip", client.conn.RemoteAddr().String())

	h.connMutext.Lock()
	defer h.connMutext.Unlock()

	close(client.send)
	client.conn.Close()

	delete(h.connections, client.conn)
}

func (h *Hub) readPump(client *Client) {
	for {
		msgType, msg, err := client.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				h.logger.Error("Error reading message: ", "error", err.Error())
			}
			return
		}

		if msgType != websocket.TextMessage {
			continue
		}

		now := time.Now()
		delta := now.Sub(client.lastReqTime)

		if delta > limitWindow {
			client.reqPerWindow = 0
			client.lastReqTime = now
		}

		if delta < limitWindow && client.reqPerWindow > maxReqPerWindow {
			continue
		}

		fireworkOptions := Firework{}
		err = json.Unmarshal(msg, &fireworkOptions)
		if err != nil {
			h.logger.Error("Error unmarshalling message: ", "error", err.Error())
			continue
		}

		client.reqPerWindow++
		client.lastReqTime = now

		IncrementFireworksCount()
		go h.broadcast(fireworkOptions, client)
	}
}

func (h *Hub) writePump(client *Client) {
	// measure the time it takes to write a message
	for firework := range client.send {
		client.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
		err := client.conn.WriteJSON(firework)
		if err != nil {
			h.logger.Error("Error writing message: ", "error", err.Error())
			break
		}
	}
}

func (h *Hub) broadcast(firework Firework, sentBy *Client) {
	h.connMutext.RLock()
	defer h.connMutext.RUnlock()

	firework.FireworksLaunched = GetFireworksCount()
	for _, client := range h.connections {
		if client == sentBy {
			continue
		}
		select {
		case client.send <- WSMessage{Type: "event", Payload: firework}:
		default:
			// if the channel is closed
			return
		}
	}
}
