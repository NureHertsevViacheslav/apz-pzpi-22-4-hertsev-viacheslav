package com.example.officespacemobile

data class Booking(
    val id: Int,
    val user_id: Int,
    val room_id: Int,
    val seats: Int,
    val start_date: String,
    val end_date: String
)