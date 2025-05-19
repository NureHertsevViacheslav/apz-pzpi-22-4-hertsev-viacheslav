package com.example.officespacemobile

import android.app.DatePickerDialog
import android.content.Context
import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.example.officespacemobile.databinding.ActivityRoomDetailsBinding
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import org.json.JSONObject
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.*

class RoomDetailsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRoomDetailsBinding
    private lateinit var btnPickStartDate: Button
    private lateinit var btnPickEndDate: Button

    private var selectedStartDate: String? = null
    private var selectedEndDate: String? = null

    private var selectedDate: String? = null
    private var roomId: Int = -1
    private var availableSeats: Int = 0
    private var roomName: String = ""

    private val client = OkHttpClient()
    private val apiUrl = "http://10.0.2.2:3000/api/bookings"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRoomDetailsBinding.inflate(layoutInflater)
        setContentView(binding.root)
        btnPickStartDate = findViewById(R.id.btnPickStartDate)
        btnPickEndDate = findViewById(R.id.btnPickEndDate)
        // отримаємо передані дані
        roomId = intent.getIntExtra("roomId", -1)
        roomName = intent.getStringExtra("roomName") ?: "???"
        availableSeats = intent.getIntExtra("roomAvailable", 0)

        val capacity = intent.getIntExtra("roomCapacity", 0)

        binding.tvDetailRoomName.text = roomName
        binding.tvDetailCapacity.text = "Місткість: $capacity, Вільно: $availableSeats"

        btnPickStartDate.setOnClickListener {
            showDatePicker { date ->
                selectedStartDate = date
                btnPickStartDate.text = "Початок: $date"
            }
        }

        btnPickEndDate.setOnClickListener {
            showDatePicker { date ->
                selectedEndDate = date
                btnPickEndDate.text = "Кінець: $date"
            }
        }
        binding.btnBook.setOnClickListener {
            val seats = binding.etSeatCount.text.toString().toIntOrNull()
            if (seats == null || seats <= 0) {
                Toast.makeText(this, "Некоректна кількість місць", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (seats > availableSeats) {
                Toast.makeText(this, "Недостатньо вільних місць", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (selectedStartDate == null || selectedEndDate == null) {
                Toast.makeText(this, "Оберіть дату початку і кінця", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            confirmBooking(seats)
        }
    }

    private fun showDatePicker(callback: (String) -> Unit) {
        val calendar = Calendar.getInstance()
        val picker = DatePickerDialog(this, { _, year, month, day ->
            val formatted = String.format("%04d-%02d-%02d", year, month + 1, day)
            callback(formatted)
        }, calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH))
        picker.show()
    }


    private fun confirmBooking(seats: Int) {
        AlertDialog.Builder(this)
            .setTitle("Підтвердити")
            .setMessage("Бронювати $seats місць у \"$roomName\" на $selectedDate?")
            .setPositiveButton("Так") { _, _ ->
                postBookingToServer(seats)
            }
            .setNegativeButton("Скасувати", null)
            .show()
    }

    private fun postBookingToServer(seats: Int) {
        val userId = getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
            .getInt("user_id", -1)

        if (userId == -1) {
            Toast.makeText(this, "Користувач не авторизований", Toast.LENGTH_SHORT).show()
            return
        }

        val json = JSONObject()
        json.put("user_id", userId)
        json.put("room_id", roomId)
        json.put("seats", seats)
        json.put("start_date", selectedStartDate)
        json.put("end_date", selectedEndDate)

        val body = RequestBody.create("application/json".toMediaTypeOrNull(), json.toString())

        val request = Request.Builder()
            .url(apiUrl)
            .post(body)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@RoomDetailsActivity, "Помилка сервера: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    if (response.isSuccessful) {
                        Toast.makeText(this@RoomDetailsActivity, "Бронювання успішне!", Toast.LENGTH_SHORT).show()
                        finish()
                    } else {
                        Toast.makeText(this@RoomDetailsActivity, "Помилка: ${response.code}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        })
    }
}
