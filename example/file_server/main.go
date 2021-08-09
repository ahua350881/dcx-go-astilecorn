package main

import (
	"log"
	"net/http"
)

func main() {
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("../file"))))
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
