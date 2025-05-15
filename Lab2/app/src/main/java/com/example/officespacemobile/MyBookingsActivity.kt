package com.example.officespacemobile

import android.content.Context
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.officespacemobile.databinding.ActivityMyBookingsBinding
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

class MyBookingsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMyBookingsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMyBookingsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val gson = Gson()
        val sharedPref = getSharedPreferences("bookings", Context.MODE_PRIVATE)
        val json = sharedPref.getString("list", null)
        val type = object : TypeToken<List<Booking>>() {}.type
        val bookings: List<Booking> = if (json != null) gson.fromJson(json, type) else emptyList()

        val adapter = BookingAdapter(bookings)
        binding.bookingsRecyclerView.layoutManager = LinearLayoutManager(this)
        binding.bookingsRecyclerView.adapter = adapter
    }
}
