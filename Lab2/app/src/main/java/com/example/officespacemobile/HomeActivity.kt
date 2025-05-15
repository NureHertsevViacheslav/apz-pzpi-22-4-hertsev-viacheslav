package com.example.officespacemobile

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.officespacemobile.databinding.ActivityHomeBinding
import android.content.Intent


class HomeActivity : AppCompatActivity() {

    private lateinit var binding: ActivityHomeBinding
    private lateinit var allRooms: List<Room>
    private lateinit var adapter: RoomAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHomeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        allRooms = listOf(
            Room("Переговорна №1", 6),
            Room("Великий конференц-зал", 20),
            Room("Кімната для брейнштормінгу", 8),
            Room("Маленька переговорка", 3)
        )

        adapter = RoomAdapter(allRooms) { selectedRoom ->
            val intent = Intent(this, RoomDetailsActivity::class.java)
            intent.putExtra("roomName", selectedRoom.name)
            intent.putExtra("roomCapacity", selectedRoom.capacity)
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

    }
}
