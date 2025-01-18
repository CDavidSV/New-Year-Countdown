package main

import (
	"encoding/binary"
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/joho/godotenv"
)

var (
	allowedDomainsSlice []string
	allowedDomains      string

	mu                sync.RWMutex
	fireworksLaunched uint64 = 0
)

type application struct {
	logger *slog.Logger
}

func (app *application) setupRoutes() http.Handler {
	mux := http.NewServeMux()

	wsHub := NewWebsocketHub(app.logger)

	mux.HandleFunc("/ws", wsHub.wsHandler)

	return mux
}

func loadFromFile(filepath string) (uint64, error) {
	fileContents, err := os.ReadFile(filepath)
	if err != nil {
		if os.IsNotExist(err) {
			return 0, nil
		}

		return 0, err
	}

	data := binary.BigEndian.Uint64(fileContents)
	return data, nil
}

func saveToFile(filepath string, data uint64) error {
	buff := make([]byte, 8)
	binary.BigEndian.PutUint64(buff, data)

	tempFilePath := filepath + ".tmp"
	err := os.WriteFile(tempFilePath, buff, 0644)
	if err != nil {
		return err
	}

	err = os.Rename(tempFilePath, filepath)
	if err != nil {
		os.Remove(tempFilePath)
		return err
	}

	return nil
}

func IncrementFireworksCount() {
	mu.Lock()
	defer mu.Unlock()

	fireworksLaunched++
}

func GetFireworksCount() uint64 {
	mu.RLock()
	defer mu.RUnlock()

	return fireworksLaunched
}

// loop handles the saving of the fireworksLaunched count to a file every 60 seconds.
func loop(done chan bool) {
	ticker := time.NewTicker(60 * time.Second)

	for {
		select {
		case <-ticker.C:
			err := saveToFile("fireworksLaunched", fireworksLaunched)
			if err != nil {
				fmt.Println("Error saving fireworksLaunched to file: ", err)
			}
		case <-done:
			err := saveToFile("fireworksLaunched", fireworksLaunched)
			if err != nil {
				fmt.Println("Error saving fireworksLaunched to file: ", err)
			}

			ticker.Stop()
			return
		}
	}
}

func main() {
	addr := flag.String("addr", ":4000", "HTTP network address")
	flag.Parse()

	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	err := godotenv.Load()
	if err != nil {
		logger.Error("Error loading .env file", "error", err.Error())
		os.Exit(1)
	}

	allowedDomains = os.Getenv("ALLOWED_DOMAINS")
	allowedDomainsSlice = strings.Split(allowedDomains, ",")

	numFireworks, err := loadFromFile("fireworksLaunched")
	if err != nil {
		logger.Error("Error loading fireworksLaunched file", "error", err.Error())
		os.Exit(1)
	}
	fireworksLaunched = numFireworks

	done := make(chan bool)
	go loop(done)

	app := &application{
		logger: logger,
	}

	srv := &http.Server{
		Addr:         *addr,
		ErrorLog:     slog.NewLogLogger(logger.Handler(), slog.LevelError),
		Handler:      app.setupRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	logger.Info("Starting server on " + *addr)
	err = srv.ListenAndServe()
	logger.Error(err.Error())

	os.Exit(1)
}
