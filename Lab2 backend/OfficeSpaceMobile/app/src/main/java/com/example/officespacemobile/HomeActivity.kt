package com.example.officespacemobile

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.officespacemobile.databinding.ActivityHomeBinding
import okhttp3.*
import org.json.JSONArray
import java.io.IOException

class HomeActivity : AppCompatActivity() {

    private lateinit var binding: ActivityHomeBinding
    private lateinit var allRooms: List<Room>
    private lateinit var adapter: RoomAdapter
    private val client = OkHttpClient()
    private val apiUrl = "http://10.0.2.2:3000/api/rooms"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHomeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        adapter = RoomAdapter(listOf()) { selectedRoom ->
            val intent = Intent(this, RoomDetailsActivity::class.java)
            intent.putExtra("roomId", selectedRoom.id)
            intent.putExtra("roomName", selectedRoom.name)
            intent.putExtra("roomCapacity", selectedRoom.capacity)
            intent.putExtra("roomAvailable", selectedRoom.availableSeats)
            startActivity(intent)
        }

        binding.roomRecyclerView.layoutManager = LinearLayoutManager(this)
        binding.roomRecyclerView.adapter = adapter

        binding.btnFilter.setOnClickListener {
            val minCapacity = binding.etMinCapacity.text.toString().toIntOrNull() ?: 0
            val filtered = allRooms.filter { it.capacity >= minCapacity }
            adapter.updateList(filtered)
        }

        binding.btnMyBookings.setOnClickListener {
            startActivity(Intent(this, MyBookingsActivity::class.java))
        }

        loadRoomsFromServer()
    }

    private fun loadRoomsFromServer() {
        val request = Request.Builder()
            .url(apiUrl)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@HomeActivity, "Помилка з’єднання з сервером", Toast.LENGTH_SHORT).show()
                    Log.e("ROOMS_ERROR", "${e.message}")
                }
            }

            override fun onResponse(call: Call, response: Response) {
                if (!response.isSuccessful) {
                    runOnUiThread {
                        Toast.makeText(this@HomeActivity, "Помилка при завантаженні кімнат", Toast.LENGTH_SHORT).show()
                    }
                    return
                }
                val body = response.body?.string() ?: return
                val roomList = JSONArray(body)
                allRooms = (0 until roomList.length()).map { i ->
                    val obj = roomList.getJSONObject(i)
                    Room(
                        id = obj.getInt("id"),
                        name = obj.getString("name"),
                        capacity = obj.getInt("capacity"),
                        availableSeats = obj.getInt("available_seats")
                    )
                }
                runOnUiThread {
                    adapter.updateList(allRooms)
                }
            }
        })
    }
}
