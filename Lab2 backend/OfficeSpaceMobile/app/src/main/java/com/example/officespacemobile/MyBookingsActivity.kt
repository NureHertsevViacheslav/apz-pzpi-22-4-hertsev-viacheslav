package com.example.officespacemobile

import android.content.Context
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.officespacemobile.databinding.ActivityMyBookingsBinding
import okhttp3.*
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class MyBookingsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMyBookingsBinding
    private val client = OkHttpClient()
    private val baseUrl = "http://10.0.2.2:3000/api"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMyBookingsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val userId = getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
            .getInt("user_id", -1)

        if (userId == -1) {
            Toast.makeText(this, "Користувач не знайдений", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        loadRoomsAndBookings(userId)
    }

    private fun loadRoomsAndBookings(userId: Int) {

        val roomRequest = Request.Builder()
            .url("$baseUrl/rooms")
            .build()

        client.newCall(roomRequest).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@MyBookingsActivity, "Помилка завантаження кімнат", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val roomJson = response.body?.string() ?: return
                val roomArray = JSONArray(roomJson)
                val rooms = mutableListOf<Room>()
                for (i in 0 until roomArray.length()) {
                    val obj = roomArray.getJSONObject(i)
                    rooms.add(
                        Room(
                            id = obj.getInt("id"),
                            name = obj.getString("name"),
                            capacity = obj.getInt("capacity"),
                            availableSeats = obj.getInt("available_seats")
                        )
                    )
                }

                loadBookings(userId, rooms)
            }
        })
    }

    private fun loadBookings(userId: Int, rooms: List<Room>) {
        val bookingRequest = Request.Builder()
            .url("$baseUrl/bookings")
            .build()

        client.newCall(bookingRequest).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("BOOKINGS_ERROR", e.message ?: "Unknown error")
                runOnUiThread {
                    Toast.makeText(this@MyBookingsActivity, "Помилка з'єднання з сервером", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val bookingJson = response.body?.string() ?: return
                val bookingArray = JSONArray(bookingJson)

                val bookings = mutableListOf<Booking>()
                for (i in 0 until bookingArray.length()) {
                    val obj: JSONObject = bookingArray.getJSONObject(i)
                    if (obj.getInt("user_id") == userId) {
                        bookings.add(
                            Booking(
                                id = obj.getInt("id"),
                                user_id = obj.getInt("user_id"),
                                room_id = obj.getInt("room_id"),
                                seats = obj.getInt("seats"),
                                start_date = obj.getString("start_date"),
                                end_date = obj.getString("end_date")
                            )
                        )
                    }
                }

                runOnUiThread {
                    val adapter = BookingAdapter(bookings, rooms)
                    binding.bookingsRecyclerView.layoutManager = LinearLayoutManager(this@MyBookingsActivity)
                    binding.bookingsRecyclerView.adapter = adapter
                }
            }
        })
    }
}
