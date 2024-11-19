package main

import (
	"flag"
	"log/slog"
	"net/http"
	"os"
	"time"
)

type application struct {
	logger *slog.Logger
}

func (app *application) setupRoutes() http.Handler {
	mux := http.NewServeMux()

	wsHub := NewWebsocketHub(app.logger)

	mux.HandleFunc("/ws", wsHub.wsHandler)

	return app.recoverPanic(commonHeaders(mux))
}

func main() {
	addr := flag.String("addr", ":4000", "HTTP network address")
	flag.Parse()

	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

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
	err := srv.ListenAndServe()
	logger.Error(err.Error())

	os.Exit(1)
}
