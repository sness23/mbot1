package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/sandertv/gophertunnel/minecraft"
)

func getenv(key, def string) string {
	v := os.Getenv(key)
	if v == "" { return def }
	return v
}

func main() {
	host := getenv("BEDROCK_HOST", "127.0.0.1")
	port := getenv("BEDROCK_PORT", "19132")
	addr := host + ":" + port

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Simple dial (RakNet is the usual network)
	conn, err := minecraft.DialContext(ctx, "raknet", addr)
	if err != nil {
		log.Fatalf("dial error: %v", err)
	}
	defer conn.Close()

	log.Printf("connected to %s (latency %v)", conn.RemoteAddr(), conn.Latency())

	// Optionally complete spawn sequence to receive world packets:
	if err := conn.DoSpawn(); err != nil {
		log.Fatalf("spawn error: %v", err)
	}

	log.Println("spawned; reading a few packets then exiting...")
	for i := 0; i < 5; i++ {
		pk, err := conn.ReadPacket()
		if err != nil { log.Fatalf("read: %v", err) }
		log.Printf("got packet: %T", pk)
	}
}
