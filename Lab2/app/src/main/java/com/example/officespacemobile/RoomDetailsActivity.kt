package com.example.officespacemobile

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.example.officespacemobile.databinding.ActivityRoomDetailsBinding
import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import android.app.DatePickerDialog
import java.util.Calendar

class RoomDetailsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRoomDetailsBinding
    private lateinit var currentRoom: Room
    private var selectedDate: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRoomDetailsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val name = intent.getStringExtra("roomName")
        val capacity = intent.getIntExtra("roomCapacity", 0)

        currentRoom = Room(name ?: "Кімната", capacity, capacity)
        updateUI()

        binding.tvDetailRoomName.text = name
        binding.tvDetailCapacity.text = "Місткість: $capacity"

        binding.btnBook.setOnClickListener {
            val requested = binding.etSeatCount.text.toString().toIntOrNull()
            if (requested == null || requested <= 0) {
                Toast.makeText(this, "Введіть коректну кількість місць", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (requested > currentRoom.availableSeats) {
                Toast.makeText(this, "Недостатньо вільних місць", Toast.LENGTH_SHORT).show()
            } else {
                AlertDialog.Builder(this)
                    .setTitle("Бронювання")
                    .setMessage("Бронювати $requested місць у кімнаті \"${currentRoom.name}\"?")
                    .setPositiveButton("Так") { _, _ ->
                        currentRoom.availableSeats -= requested
                        saveBooking(currentRoom.name, requested)
                        Toast.makeText(this, "Заброньовано $requested місць!", Toast.LENGTH_SHORT).show()
                        updateUI()
                    }
                    .setNegativeButton("Скасувати", null)
                    .show()
            }
        }

        binding.btnPickDateTime.setOnClickListener {
            val calendar = Calendar.getInstance()

            val datePicker = DatePickerDialog(
                this,
                { _, year, month, dayOfMonth ->
                    // формат дати: YYYY-MM-DD
                    val formatted = String.format("%04d-%02d-%02d", year, month + 1, dayOfMonth)
                    selectedDate = formatted
                    Toast.makeText(this, "Обрана дата: $formatted", Toast.LENGTH_SHORT).show()
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
            )

            datePicker.show()
        }

    }

    private fun updateUI() {
        binding.tvDetailRoomName.text = currentRoom.name
        binding.tvDetailCapacity.text = "Вільно місць: ${currentRoom.availableSeats} / ${currentRoom.capacity}"
    }

    private fun saveBooking(roomName: String, seats: Int) {
        val sharedPref = getSharedPreferences("bookings", Context.MODE_PRIVATE)
        val gson = Gson()

        val existingJson = sharedPref.getString("list", null)
        val type = object : TypeToken<MutableList<Booking>>() {}.type
        val bookings: MutableList<Booking> = if (existingJson != null)
            gson.fromJson(existingJson, type)
        else
            mutableListOf()

        val date = selectedDate ?: java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault()).format(java.util.Date())
        bookings.add(Booking(roomName, seats, date))



        sharedPref.edit().putString("list", gson.toJson(bookings)).apply()
    }
}
