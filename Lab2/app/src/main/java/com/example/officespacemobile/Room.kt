package com.example.officespacemobile

data class Room(
    val name: String,
    val capacity: Int,
    var availableSeats: Int = capacity
)