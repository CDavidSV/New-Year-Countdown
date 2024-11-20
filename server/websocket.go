package main

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Hub struct {
	connections map[*websocket.Conn]struct{}
	logger      *slog.Logger
	connMutext  sync.RWMutex
}

type Firework struct {
	ScreenWidth  int    `json:"screenWidth"`
	ScreenHeight int    `json:"screenHeight"`
	InitX        int    `json:"initX"`
	InitY        int    `json:"initY"`
	EndX         int    `json:"endX"`
	EndY         int    `json:"endY"`
	Color        string `json:"color"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin:       originChecker,
	EnableCompression: true,
} // use default options

func NewWebsocketHub(logger *slog.Logger) *Hub {
	return &Hub{
		connections: make(map[*websocket.Conn]struct{}),
		logger:      logger,
	}
}

func (h *Hub) wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)

	if err := conn.SetCompressionLevel(4); err != nil {
		h.logger.Error("Error setting compression level: ", "error", err.Error())
		conn.Close()
		return
	}

	if err != nil {
		h.logger.Error("Error upgrading connection: ", "error", err.Error())
		return
	}

	h.addConnection(conn)

	go h.readPump(conn)
}

func originChecker(r *http.Request) bool {
	for _, domain := range allowedDomainsSlice {
		if r.Header.Get("Origin") == domain {
			return true
		}
	}

	return false
}

func (h *Hub) addConnection(conn *websocket.Conn) {
	h.logger.Info("new connection established", "ip", conn.RemoteAddr().String())

	h.connMutext.Lock()
	defer h.connMutext.Unlock()

	h.connections[conn] = struct{}{}
}

func (h *Hub) removeConnection(conn *websocket.Conn) {
	h.connMutext.Lock()
	defer h.connMutext.Unlock()

	delete(h.connections, conn)
}

func (h *Hub) readPump(conn *websocket.Conn) {
	for {
		msgType, msg, err := conn.ReadMessage()
		if err != nil {
			h.logger.Error("Error reading message: ", "error", err.Error())
			h.removeConnection(conn)
			return
		}

		if msgType != websocket.TextMessage {
			continue
		}

		fireworkOptions := Firework{}
		err = json.Unmarshal(msg, &fireworkOptions)
		if err != nil {
			h.logger.Error("Error unmarshalling message: ", "error", err.Error())
			continue
		}

		h.logger.Info("Broadcasting new firework: ", "message", msg)
		h.broadcast(fireworkOptions, conn)
	}
}

func (h *Hub) broadcast(msg Firework, except *websocket.Conn) {
	h.connMutext.RLock()
	defer h.connMutext.RUnlock()

	for conn := range h.connections {
		if conn == except {
			continue
		}

		err := conn.WriteJSON(msg)
		if err != nil {
			h.logger.Error("Error writing message: ", "error", err.Error())
		}

	}
}
